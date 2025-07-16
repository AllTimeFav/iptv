jQuery(document).ready(function($) {
    // =============================================
    // AD CONFIGURATION (REPLACE WITH YOUR REAL IDs)
    // =============================================
    const adConfig = {
        adsense: {
            clientId: "ca-pub-9700554883020818",  // From AdSense Account Settings
            stickyBannerUnit: "7485309558", // For bottom banner
            inContentUnit: "7640162739" // For between-step ads
        }
    };

    // =====================
    // AD LOADING SYSTEM
    // =====================
    function loadAdScript() {
        if (typeof adsbygoogle === 'undefined') {
            const script = document.createElement('script');
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.adsense.clientId}`;
            script.crossOrigin = "anonymous";
            script.async = true;
            document.head.appendChild(script);
        }
    }

    // =====================
    // AD MANAGER
    // =====================
    const AdManager = {
        showStickyBanner: function() {
            // Remove existing banner if present
            $('#sticky-ad-container').remove();
            
            // Create new banner
            const banner = `
                <div id="sticky-ad-container" style="position:fixed; bottom:0; width:100%; z-index:9999; background:#fff; padding:10px 0; box-shadow:0 -2px 10px rgba(0,0,0,0.1);">
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-client="${adConfig.adsense.clientId}"
                         data-ad-slot="${adConfig.adsense.stickyBannerUnit}"
                         data-ad-format="auto"
                         data-full-width-responsive="true"></ins>
                </div>
            `;
            
            $('body').append(banner);
            (adsbygoogle = window.adsbygoogle || []).push({});
        },

        showInContentAd: function(insertAfterElement) {
            const adHtml = `
                <div class="in-content-ad" style="margin:25px 0; text-align:center;">
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-client="${adConfig.adsense.clientId}"
                         data-ad-slot="${adConfig.adsense.inContentUnit}"
                         data-ad-format="fluid"
                         data-full-width-responsive="true"></ins>
                </div>
            `;
            
            $(insertAfterElement).after(adHtml);
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    };

    // =================================
    // IPTV GENERATOR CORE FUNCTIONALITY
    // =================================
    let generatedData = {};
    let currentStep = 0;
    const $generateBtn = $('#generate-btn');
    const $nextBtn = $('#next-btn');
    const $copyAllBtn = $('#copy-all-btn');
    const $doneBtn = $('#done-btn');
    const $checkBtn = $('#check-server-btn');
    const $fields = $('.field-row input');

    // Initialize
    resetForm();
    loadAdScript();

    // Generate button click
    $generateBtn.on('click', function(e) {
        e.preventDefault();
        const $btn = $(this);
        $btn.prop('disabled', true).text('GENERATING...');
        
        $.ajax({
            url: iptv_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'generate_iptv',
                nonce: iptv_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    generatedData = response.data;
                    $('#iptv-server').val(generatedData.server);
                    $nextBtn.show();
                    $generateBtn.hide();
                    
                    // Show initial ads
                    AdManager.showStickyBanner();
                    AdManager.showInContentAd($('#iptv-server').closest('.field-row'));
                }
            },
            complete: function() {
                $btn.prop('disabled', false);
            }
        });
    });

    // Next button click
    $nextBtn.on('click', function(e) {
        e.preventDefault();
        currentStep++;
        
        switch(currentStep) {
            case 1:
                $('#iptv-username').val(generatedData.username);
                AdManager.showInContentAd($('#iptv-username').closest('.field-row'));
                break;
                
            case 2:
                $('#iptv-password').val(generatedData.password);
                AdManager.showStickyBanner(); // Refresh banner
                break;
                
            case 3:
                $('#iptv-expiry').val(generatedData.expiry);
                AdManager.showInContentAd($('#iptv-expiry').closest('.field-row'));
                break;
                
            case 4:
                $('#iptv-region').val(generatedData.region);
                $nextBtn.hide();
                $copyAllBtn.show();
                $doneBtn.show();
                AdManager.showStickyBanner(); // Final banner refresh
                break;
        }
        
        checkFieldsCompletion();
    });

    // Copy buttons with ad triggers
    $(document).on('click', '.copy-btn', function() {
        if (!$('#sticky-ad-container').length) {
            AdManager.showStickyBanner();
        }
        copyField($(this).data('target'), $(this));
    });

    $copyAllBtn.on('click', function() {
        AdManager.showStickyBanner();
        copyAllFields($(this));
    });

    // Done button
    $doneBtn.on('click', function(e) {
        e.preventDefault();
        resetForm();
    });

// Check server button - Fixed version
$checkBtn.on('click', function(e) {
    e.preventDefault();
    const $btn = $(this);
    const originalText = $btn.text();
    
    $btn.prop('disabled', true).text('CHECKING...');
    
    // Clear any previous results
    $('#check-result').remove();
    
    $.ajax({
        url: iptv_ajax.ajax_url,
        type: 'POST',
        data: {
            action: 'check_iptv_server',
            nonce: iptv_ajax.nonce,
            server: $('#iptv-server').val(),
            username: $('#iptv-username').val(),
            password: $('#iptv-password').val()
        },
        dataType: 'json',
        success: function(response) {
            let resultHtml = '';
            if (response.success) {
                const data = response.data;
                if (data.working) {
                    resultHtml = `
                        <div id="check-result" class="check-success">
                            <strong>✅ Server is working!</strong>
                            <div>Status: Active</div>
                            ${data.message ? `<div>${data.message}</div>` : ''}
                        </div>
                    `;
                } else {
                    resultHtml = `
                        <div id="check-result" class="check-error">
                            <strong>❌ Server not working</strong>
                            <div>Reason: ${data.message || 'Unknown error'}</div>
                            <div>Try these solutions:
                                <ul>
                                    <li>Check if the server URL is correct</li>
                                    <li>Verify your internet connection</li>
                                    <li>The server may be temporarily down</li>
                                </ul>
                            </div>
                        </div>
                    `;
                }
            } else {
                resultHtml = `
                    <div id="check-result" class="check-error">
                        <strong>⚠️ Error checking server</strong>
                        <div>${response.data.message || 'Unknown error occurred'}</div>
                    </div>
                `;
            }
            
            $checkBtn.after(resultHtml);
        },
        error: function(xhr, status, error) {
            $checkBtn.after(`
                <div id="check-result" class="check-error">
                    <strong>⚠️ Network Error</strong>
                    <div>${error || status || 'Unknown error'}</div>
                    <div>Please try again later</div>
                </div>
            `);
        },
        complete: function() {
            $btn.prop('disabled', false).text(originalText);
        }
    });
});

    // =====================
    // HELPER FUNCTIONS
    // =====================
    function resetForm() {
        $fields.val('');
        $generateBtn.show().text('G E N E R A T E');
        $nextBtn.hide();
        $copyAllBtn.hide();
        $doneBtn.hide();
        $checkBtn.hide();
        currentStep = 0;
        $('#sticky-ad-container').remove();
    }

    function checkFieldsCompletion() {
        const allFilled = $fields.toArray().every(field => $(field).val().trim() !== '');
        $checkBtn.toggle(allFilled);
    }

    function copyField(target, $button) {
        const text = $(`#${target}`).val();
        if (!text) {
            alert('Please generate credentials first!');
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            showFeedback($button);
        }).catch(() => {
            fallbackCopy(text, $button);
        });
    }

    function copyAllFields($button) {
        const text = $fields.toArray()
            .map(field => `${$(field).prev('label').text()}: ${$(field).val()}`)
            .join('\n');
            
        navigator.clipboard.writeText(text).then(() => {
            showFeedback($button, '✓ COPIED!', 'COPY ALL');
        }).catch(() => {
            fallbackCopy(text, $button, '✓ COPIED!', 'COPY ALL');
        });
    }

    function showFeedback($element, successText = '✓', originalText = '⎘') {
        $element.addClass('copied').html(successText);
        setTimeout(() => {
            $element.removeClass('copied').html(originalText);
        }, 2000);
    }

    function fallbackCopy(text, $button, successText = '✓', originalText = '⎘') {
        const $temp = $('<textarea>').val(text).appendTo('body').select();
        document.execCommand('copy');
        $temp.remove();
        showFeedback($button, successText, originalText);
    }
});