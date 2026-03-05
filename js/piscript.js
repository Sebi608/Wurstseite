            let currentDigit = 0;
            const batchSize = 500;
            let isLoading = false;

            async function fetchPi() {
                if (isLoading) return;
                isLoading = true;
                
                try {
                    const response = await fetch(`https://api.pi.delivery/v1/pi?start=${currentDigit}&numberOfDigits=${batchSize}`);
                    if (!response.ok) throw new Error('API-Fehler');
                    
                    const data = await response.json();

                    if (data.content) {
                        const display = document.getElementById('pi-display');
                        let content = data.content;

                        if (currentDigit === 0 && content.charAt(0) === '3') {
                            content = "3." + content.substring(1);
                        }

                        const textNode = document.createTextNode(content);
                        display.appendChild(textNode);
                        
                        currentDigit += batchSize;
                    }
                } catch (error) {
                    console.error("Pi-Fehler:", error);
                } finally {
                    isLoading = false;
                    checkAutoFill();
                }
            }

            function checkAutoFill() {
                const display = document.getElementById('pi-display');
                const rect = display.getBoundingClientRect();
                if (rect.bottom < window.innerHeight + 1000) {
                    fetchPi();
                }
            }

            window.addEventListener('scroll', () => {
                checkAutoFill();
            });

            fetchPi();