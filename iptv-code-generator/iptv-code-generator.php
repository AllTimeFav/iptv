<?php
/*
Plugin Name: IPTV Code Generator
Description: Generates IPTV server credentials with admin management
Version: 1.8
Author: Your Name
*/

if (!defined('ABSPATH')) exit;

class IPTV_Generator {
    private static $instance = null;
    private $table_name;

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'iptv_codes';
    }

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function init() {
        // Frontend
        add_shortcode('iptv_generator', [$this, 'shortcode']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('wp_ajax_generate_iptv', [$this, 'ajax_generate']);
        add_action('wp_ajax_nopriv_generate_iptv', [$this, 'ajax_generate']);
        add_action('wp_ajax_check_iptv_server', [$this, 'ajax_check_server']);
        add_action('wp_ajax_nopriv_check_iptv_server', [$this, 'ajax_check_server']);
        
        // Admin
        add_action('admin_menu', [$this, 'admin_menu']);
        add_action('admin_init', [$this, 'check_table']);
        register_activation_hook(__FILE__, [$this, 'activate']);
    }

    public function activate() {
        $this->create_table();
        flush_rewrite_rules();
    }

    public function check_table() {
        if (!current_user_can('manage_options')) return;
        
        if (!$this->table_exists()) {
            $this->create_table();
        }
    }

    /* ADMIN FUNCTIONS */
    public function admin_menu() {
        add_menu_page(
            'IPTV Generator',
            'IPTV Generator',
            'manage_options',
            'iptv-generator',
            [$this, 'admin_page'],
            'dashicons-admin-generic',
            80
        );
    }

    public function admin_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.'));
        }

        // Handle form submissions
        if (isset($_POST['action'])) {
            check_admin_referer('iptv_admin_action');
            
            switch ($_POST['action']) {
                case 'import_servers':
                    if (!empty($_FILES['import_file']['tmp_name'])) {
                        $result = $this->import_servers($_FILES['import_file']['tmp_name']);
                        
                        $message = is_array($result) ? 
                            sprintf('Imported %d records, %d failed', $result['imported'], $result['failed']) : 
                            'Error: ' . $result;
                        $type = is_array($result) ? ($result['failed'] > 0 ? 'warning' : 'updated') : 'error';
                        add_settings_error('iptv_messages', 'iptv_message', $message, $type);
                        
                        if (!empty($result['failed_rows'])) {
                            set_transient('iptv_failed_rows', $result['failed_rows'], HOUR_IN_SECONDS);
                        }
                    }
                    break;
                
                case 'delete_table':
                    $this->delete_table();
                    add_settings_error('iptv_messages', 'iptv_message', 'All servers deleted successfully', 'updated');
                    break;
                
                case 'download_failed':
                    $this->download_failed_rows();
                    break;
            }
        }

        // Get server count
        $server_count = $this->table_exists() ? $this->get_server_count() : 0;
        ?>
        <div class="wrap">
            <h1>IPTV Generator</h1>
            
            <?php settings_errors('iptv_messages'); ?>
            
            <div class="card">
                <h2>Server Management</h2>
                <form method="post">
                    <?php wp_nonce_field('iptv_admin_action'); ?>
                    <input type="hidden" name="action" value="delete_table">
                    
                    <table class="form-table">
                        <tr>
                            <th>Current Status</th>
                            <td>
                                <?php if ($this->table_exists()): ?>
                                    <span style="color:green">✓ Database contains <?php echo $server_count; ?> servers</span>
                                <?php else: ?>
                                    <span style="color:red">✖ No database table exists</span>
                                <?php endif; ?>
                            </td>
                        </tr>
                    </table>
                    
                    <?php if ($this->table_exists()): ?>
                        <?php submit_button('Delete All Servers', 'delete'); ?>
                    <?php endif; ?>
                </form>
            </div>
            
            <div class="card">
                <h2>Import Servers</h2>
                <form method="post" enctype="multipart/form-data">
                    <?php wp_nonce_field('iptv_admin_action'); ?>
                    <input type="hidden" name="action" value="import_servers">
                    
                    <table class="form-table">
                        <tr>
                            <th><label for="import_file">Import File</label></th>
                            <td>
                                <input type="file" name="import_file" id="import_file" accept=".csv,.xlsx,.xml" required>
                                <p class="description">CSV Format: server_url,username,password,expiry_date,region</p>
                            </td>
                        </tr>
                    </table>
                    
                    <?php submit_button('Import Servers', 'primary'); ?>
                    
                    <?php if (get_transient('iptv_failed_rows')): ?>
                        <p>
                            <button type="submit" name="action" value="download_failed" class="button button-secondary">
                                Download Failed Rows
                            </button>
                        </p>
                    <?php endif; ?>
                </form>
            </div>
        </div>
        <?php
    }

    /* DATABASE FUNCTIONS */
    private function table_exists() {
        global $wpdb;
        return $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $this->table_name)) == $this->table_name;
    }

    public function create_table() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$this->table_name} (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            server_url varchar(255) NOT NULL,
            username varchar(255) NOT NULL,
            password varchar(255) NOT NULL,
            expiry_date datetime DEFAULT '0000-00-00 00:00:00',
            region varchar(255) DEFAULT '',
            city varchar(255) DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY server_url (server_url),
            KEY expiry_date (expiry_date)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    public function delete_table() {
        global $wpdb;
        $wpdb->query("TRUNCATE TABLE {$this->table_name}");
    }

    private function get_server_count() {
        global $wpdb;
        return $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name}");
    }

    private function import_servers($file_path) {
        global $wpdb;
        
        if (!file_exists($file_path)) {
            return 'File not found';
        }

        $imported = 0;
        $failed = 0;
        $failed_rows = [];

        $file = fopen($file_path, 'r');
        if (!$file) {
            return 'Could not open file';
        }

        // Skip first row (D2 cell with date)
        fgetcsv($file);
        
        // Get header row
        $headers = fgetcsv($file);
        if (!$headers) {
            fclose($file);
            return 'Invalid file format: Missing header row';
        }

        while (($row = fgetcsv($file)) !== false) {
            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            // Get values - using array indexes directly
            $server_url = isset($row[0]) ? trim($row[0]) : '';
            $username = isset($row[1]) ? trim($row[1]) : '';
            $password = isset($row[2]) ? trim($row[2]) : '';
            $expiry_date_str = isset($row[3]) ? trim($row[3]) : '';
            $region = isset($row[4]) ? trim($row[4]) : '';

            // Process expiry date (try multiple formats)
            $expiry_date = '0000-00-00 00:00:00';
            if (!empty($expiry_date_str)) {
                // Try format "23/05/2025, 18:35"
                $date_part = explode(',', $expiry_date_str)[0];
                $date = DateTime::createFromFormat('d/m/Y', trim($date_part));
                
                if (!$date) {
                    // Try other formats if needed
                    $date = DateTime::createFromFormat('Y-m-d', trim($expiry_date_str));
                }
                
                if ($date) {
                    $expiry_date = $date->format('Y-m-d') . ' 23:59:59';
                }
            }

            $result = $wpdb->insert($this->table_name, [
                'server_url' => $server_url,
                'username' => $username,
                'password' => $password,
                'expiry_date' => $expiry_date,
                'region' => $region,
                'city' => ''
            ]);

            if ($result === false) {
                $failed++;
                $failed_rows[] = $row;
            } else {
                $imported++;
            }
        }
        
        fclose($file);

        return [
            'imported' => $imported,
            'failed' => $failed,
            'failed_rows' => $failed_rows
        ];
    }

    private function download_failed_rows() {
        $failed_rows = get_transient('iptv_failed_rows');
        if (empty($failed_rows)) {
            return;
        }

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="failed_rows.csv"');
        
        $output = fopen('php://output', 'w');
        fputcsv($output, ['server_url', 'username', 'password', 'expiry_date', 'region']);
        
        foreach ($failed_rows as $row) {
            fputcsv($output, $row);
        }
        
        fclose($output);
        delete_transient('iptv_failed_rows');
        exit;
    }

    /* FRONTEND FUNCTIONS */
    public function enqueue_assets() {
        wp_enqueue_style(
            'iptv-generator-css',
            plugins_url('assets/css/iptv-generator.css', __FILE__),
            [],
            filemtime(plugin_dir_path(__FILE__) . 'assets/css/iptv-generator.css')
        );

        wp_enqueue_script(
            'iptv-generator-js', 
            plugins_url('assets/js/iptv-generator.js', __FILE__),
            ['jquery'],
            filemtime(plugin_dir_path(__FILE__) . 'assets/js/iptv-generator.js'),
            true
        );

        wp_localize_script('iptv-generator-js', 'iptv_ajax', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('iptv_generator_nonce')
        ]);
    }

    public function shortcode() {
        ob_start(); ?>
        <div id="iptv-generator">
            <h1>Get Your Server</h1>
            <h2>In Steps</h2>
            
            <div class="field-row">
                <label>Server:</label>
                <div class="input-copy-group">
                    <input type="text" id="iptv-server" readonly>
                    <button class="copy-btn" data-target="iptv-server">⎘</button>
                </div>
            </div>
            
            <div class="field-row">
                <label>Username:</label>
                <div class="input-copy-group">
                    <input type="text" id="iptv-username" readonly>
                    <button class="copy-btn" data-target="iptv-username">⎘</button>
                </div>
            </div>
            
            <div class="field-row">
                <label>Password:</label>
                <div class="input-copy-group">
                    <input type="text" id="iptv-password" readonly>
                    <button class="copy-btn" data-target="iptv-password">⎘</button>
                </div>
            </div>
            
            <div class="field-row">
                <label>Expiration:</label>
                <div class="input-copy-group">
                    <input type="text" id="iptv-expiry" readonly>
                    <button class="copy-btn" data-target="iptv-expiry">⎘</button>
                </div>
            </div>
            
            <div class="field-row">
                <label>Region/City:</label>
                <div class="input-copy-group">
                    <input type="text" id="iptv-region" readonly>
                    <button class="copy-btn" data-target="iptv-region">⎘</button>
                </div>
            </div>
            
            <button id="generate-btn" class="generate-btn">G E N E R A T E</button>
            <button id="next-btn" class="next-btn" style="display:none;">N E X T</button>
            <button id="copy-all-btn" class="copy-all-btn" style="display:none;">C O P Y A L L</button>
            <button id="done-btn" class="done-btn" style="display:none;">D O N E</button>
            <button id="check-server-btn" class="check-btn" style="display:none;">CHECK SERVER</button>
            
            <div class="branding">Xtream-Generator.Com</div>
        </div>
        <?php
        return ob_get_clean();
    }

public function ajax_generate() {
    check_ajax_referer('iptv_generator_nonce', 'nonce');
    
    global $wpdb;
    $current_date = current_time('mysql');

    // Optimized query with better indexing
    $server = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM {$this->table_name} 
             WHERE expiry_date > %s OR expiry_date = '0000-00-00 00:00:00'
             ORDER BY RAND() LIMIT 1",
            $current_date
        ),
        ARRAY_A
    );

    if (!$server) {
        // Try without date restriction if no servers found
        $server = $wpdb->get_row(
            "SELECT * FROM {$this->table_name} ORDER BY RAND() LIMIT 1",
            ARRAY_A
        );
    }

    if ($server) {
        $expiry = ($server['expiry_date'] == '0000-00-00 00:00:00') 
            ? 'Never expires' 
            : date('m/d/Y', strtotime($server['expiry_date']));
        
        wp_send_json_success([
            'server' => $server['server_url'],
            'username' => $server['username'],
            'password' => $server['password'],
            'expiry' => $expiry,
            'region' => $server['region']
        ]);
    } else {
        wp_send_json_error(['message' => 'No available servers found']);
    }
}

public function ajax_check_server() {
    // Verify security nonce
    if (!check_ajax_referer('iptv_generator_nonce', 'nonce', false)) {
        wp_send_json_error(['message' => 'Security verification failed']);
    }

    // Validate and sanitize input
    $server = isset($_POST['server']) ? esc_url_raw($_POST['server']) : '';
    $username = isset($_POST['username']) ? sanitize_user($_POST['username']) : '';
    $password = isset($_POST['password']) ? sanitize_text_field($_POST['password']) : '';
    
    if (empty($server) || empty($username) || empty($password)) {
        wp_send_json_error(['message' => 'All fields are required']);
    }

    // Normalize server URL
    $server = $this->normalize_server_url($server);
    if (!$server) {
        wp_send_json_error(['message' => 'Invalid server URL format']);
    }

    // Check server connection
    $connection = $this->test_server_connection($server);
    if (!$connection['success']) {
        wp_send_json_success([
            'status' => 'error',
            'working' => false,
            'message' => $connection['error'],
            'solution' => $this->get_connection_solution($connection),
            'details' => $connection
        ]);
    }

    // Verify API endpoint
    $api_response = $this->check_api_connection($server, $username, $password);
    if (!$api_response['success']) {
        wp_send_json_success([
            'status' => 'error',
            'working' => false,
            'message' => $api_response['error'],
            'solution' => $api_response['solution'],
            'details' => $api_response
        ]);
    }

    // Successful response
    wp_send_json_success([
        'status' => 'success',
        'working' => true,
        'message' => 'Server is fully operational',
        'server_info' => $api_response['data'],
        'connection' => $connection
    ]);
}

private function normalize_server_url($url) {
    $url = trim($url);
    
    // Add protocol if missing
    if (!preg_match("~^(?:f|ht)tps?://~i", $url)) {
        $url = "http://" . $url;
    }
    
    // Validate URL structure
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return false;
    }
    
    // Remove trailing slashes
    return rtrim($url, '/');
}

private function test_server_connection($server) {
    $parsed = parse_url($server);
    $host = $parsed['host'] ?? '';
    $port = $parsed['port'] ?? 80;
    
    // List of all IPTV ports to check
    $ports_to_check = array_unique([
        $port, 80, 8080, 8000, 8443, 8880, 
        25461, 25462, 20561, 20562, 
        3050, 2095, 2096
    ]);
    
    $results = [];
    $last_error = '';
    
$primary_port_success = false;

foreach ($ports_to_check as $check_port) {
    $timeout = ($check_port == $port) ? 4 : 2;
    $connected = @fsockopen($host, $check_port, $errno, $errstr, $timeout);

    $results[$check_port] = [
        'port' => $check_port,
        'connected' => (bool)$connected,
        'error' => $connected ? null : "$errno: $errstr",
        'timeout' => $timeout
    ];

    if ($check_port == $port && $connected) {
        fclose($connected);
        return [
            'success' => true,
            'host' => $host,
            'port' => $check_port,
            'method' => 'fsockopen',
            'alternate_port' => false
        ];
    }

    if ($connected) {
        fclose($connected);
        $primary_port_success = true; // Only used for diagnosis, not logic flow
    }

    $last_error = "$check_port: $errstr (Error $errno)";
}

return [
    'success' => false,
    'error' => "Could not connect on port $port",
    'last_error' => $last_error,
    'host' => $host,
    'original_port' => $port,
    'tried_ports' => $results
];

}

private function check_api_connection($server, $username, $password) {
    $api_url = $server . '/player_api.php?username=' . urlencode($username) . '&password=' . urlencode($password);
    
    // Try multiple connection methods
    $methods = [
        'wp_remote' => function() use ($api_url) {
            $response = wp_remote_get($api_url, [
                'timeout' => 5,
                'sslverify' => false,
                'redirection' => 0,
                'headers' => [
                    'User-Agent' => 'IPTV Generator/2.0',
                    'Accept' => 'application/json'
                ]
            ]);
            
            if (is_wp_error($response)) {
                return ['error' => $response->get_error_message()];
            }
            
            return [
                'code' => wp_remote_retrieve_response_code($response),
                'body' => wp_remote_retrieve_body($response)
            ];
        },
        'curl' => function() use ($api_url) {
            if (!function_exists('curl_init')) {
                return ['error' => 'cURL not available'];
            }
            
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $api_url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 5,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_HTTPHEADER => [
                    'User-Agent: IPTV Generator/2.0',
                    'Accept: application/json'
                ]
            ]);
            
            $body = curl_exec($ch);
            $error = curl_error($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($error) {
                return ['error' => $error];
            }
            
            return [
                'code' => $code,
                'body' => $body
            ];
        }
    ];
    
    foreach ($methods as $method => $callback) {
        $result = $callback();
        
        if (isset($result['code']) && $result['code'] == 200 && !empty($result['body'])) {
            $data = @json_decode($result['body'], true);
            return [
                'success' => true,
                'method' => $method,
                'data' => $data['user_info'] ?? null
            ];
        }
        
        if (isset($result['error'])) {
            $last_error = "$method failed: " . $result['error'];
        } else {
            $last_error = "$method returned HTTP " . ($result['code'] ?? '0') . 
                         (empty($result['body']) ? ' (Empty response)' : '');
        }
    }
    
    return [
        'success' => false,
        'error' => $last_error,
        'solution' => implode('<br>', [
            '1. Verify your username and password',
            '2. Check if API endpoint exists',
            '3. Contact your service provider'
        ]),
        'api_url' => $api_url
    ];
}

private function get_connection_solution($connection) {
    $host = $connection['host'] ?? 'unknown';
    $port = $connection['original_port'] ?? 'unknown';
    $last_error = $connection['last_error'] ?? 'Unknown error';
    
    $solutions = [
        "1. Verify server address: <strong>$host:$port</strong>",
        "2. Test connection manually: <code>telnet $host $port</code>",
        "3. Contact your IPTV service provider",
        "4. Server may be temporarily down"
    ];
    
    // Add specific solution for Error 111
    if (strpos($last_error, '111:') !== false) {
        array_unshift($solutions, 
            "0. Firewall may be blocking the port - check server configuration");
    }
    
    return implode('<br>', $solutions);

}
}

IPTV_Generator::get_instance()->init();