lucide.createIcons();
        let currentRates = { gold: 0, silver: 0 };
        let cart = [];

        // --- NAVIGATION LOGIC ---
        function route(e, pageId) {
            if(e) e.preventDefault();
            
            // 1. UI Updates
            document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
            document.getElementById(`page-${pageId}`).classList.add('active');
            
            // 2. Scroll to top
            window.scrollTo(0,0);
            
            // 3. Mobile Menu Close
            document.getElementById('mobile-menu').classList.add('hidden');

            // 4. Active State for Nav Links
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('text-yellow-600'));
            const activeLink = document.getElementById(`nav-${pageId}`);
            if(activeLink) activeLink.classList.add('text-yellow-600');
        }

        function toggleMobileMenu() {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        }

        // --- SHOPPING CART LOGIC ---
        function toggleCart() {
            const panel = document.getElementById('cart-panel');
            const overlay = document.getElementById('cart-overlay');
            const isOpen = panel.classList.contains('cart-open');

            if(isOpen) {
                panel.classList.remove('cart-open');
                panel.classList.add('cart-closed');
                overlay.classList.add('hidden');
            } else {
                panel.classList.remove('cart-closed');
                panel.classList.add('cart-open');
                overlay.classList.remove('hidden');
            }
        }

        function addToCart(name, price) {
            cart.push({ name, price, id: Date.now() });
            updateCartUI();
            
            // Visual feedback
            const btn = event.currentTarget;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i>';
            btn.classList.add('bg-green-600', 'border-green-600');
            lucide.createIcons();
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('bg-green-600', 'border-green-600');
                lucide.createIcons();
            }, 1000);
        }

        function removeFromCart(id) {
            cart = cart.filter(item => item.id !== id);
            updateCartUI();
        }

        function updateCartUI() {
            const count = cart.length;
            const badge = document.getElementById('cart-count');
            const mobileBadge = document.getElementById('cart-count-mobile');
            
            // Update Badges
            [badge, mobileBadge].forEach(el => {
                el.innerText = count;
                el.style.opacity = count > 0 ? '1' : '0';
            });

            // Update List
            const list = document.getElementById('cart-items');
            const emptyState = document.getElementById('cart-empty');
            const checkoutBtn = document.getElementById('checkout-btn');
            
            if(count === 0) {
                emptyState.style.display = 'block';
                list.innerHTML = '';
                list.appendChild(emptyState);
                checkoutBtn.disabled = true;
                document.getElementById('cart-total').innerText = "₹ 0";
            } else {
                emptyState.style.display = 'none';
                list.innerHTML = '';
                let total = 0;

                cart.forEach(item => {
                    total += item.price;
                    const el = document.createElement('div');
                    el.className = "flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-gray-100";
                    el.innerHTML = `
                        <div>
                            <p class="font-bold text-sm text-slate-800">${item.name}</p>
                            <p class="text-xs text-slate-500">Spot: ₹${item.price.toLocaleString()}</p>
                        </div>
                        <button onclick="removeFromCart(${item.id})" class="text-red-400 hover:text-red-600 p-1">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    `;
                    list.appendChild(el);
                });
                
                document.getElementById('cart-total').innerText = `₹ ${total.toLocaleString()}`;
                checkoutBtn.disabled = false;
                lucide.createIcons();
            }
        }

        function checkout() {
            // 1. Close Cart
            toggleCart();
            
            // 2. Route to Contact
            route(null, 'contact');
            
            // 3. Populate Form with Basket
            const msgBox = document.getElementById('req-msg');
            let basketText = "I am interested in buying the following items from my basket:\n";
            let total = 0;
            
            cart.forEach((item, index) => {
                basketText += `${index + 1}. ${item.name} (Ref Price: ₹${item.price.toLocaleString()})\n`;
                total += item.price;
            });
            basketText += `\nEstimated Total: ₹${total.toLocaleString()}`;
            
            msgBox.value = basketText;
            
            // 4. Scroll to form
            document.getElementById('inquiryForm').scrollIntoView({ behavior: 'smooth' });
        }

        // --- FETCH RATES LOGIC ---
        async function fetchRates() {
            try {
                // Fetch from Backend
                const res = await fetch('https://nsl-backend-g34r.onrender.com');
                const data = await res.json();
                
                if(data.gold_995) {
                    currentRates.gold = data.gold_999;
                    currentRates.silver = data.silver;
                    
                    renderRates(data);
                    
                    const heroPrice = document.getElementById('hero-price');
                    if(heroPrice) heroPrice.innerText = data.gold_999.toLocaleString();

                    const usdDisplay = document.getElementById('rate-usd');
                    if(usdDisplay) usdDisplay.innerText = `₹ ${data.usd}`;
                    
                    calculate();
                }
            } catch (err) {
                console.log("Backend offline, retrying...");
            }
        }

        function renderRates(data) {
            const container = document.getElementById('rates-container');
            const time = data.last_updated || 'Just now';
            
            const products = [
                { name: 'GOLD 999 (10g)', bid: data.gold_999, ask: data.gold_999 + 250, color: 'text-yellow-600' },
                { name: 'GOLD 995 (10g)', bid: data.gold_995, ask: data.gold_995 + 250, color: 'text-yellow-700' },
                { name: 'SILVER (1kg)', bid: data.silver, ask: data.silver + 600, color: 'text-gray-500' }
            ];

            let html = '';
            products.forEach(p => {
                // Determine display price
                const displayPrice = p.ask;

                html += `
                <div class="grid grid-cols-5 p-5 items-center hover:bg-gray-50 transition-colors group">
                    <div class="pl-4 font-bold ${p.color} col-span-2 md:col-span-1 flex items-center gap-2">
                        ${p.name}
                    </div>
                    <div class="hidden md:block text-center font-mono font-bold text-slate-700 bg-white border border-gray-100 py-2 rounded-lg shadow-sm">
                        ₹${p.bid.toLocaleString()}
                    </div>
                    <div class="hidden md:block text-center font-mono font-bold text-slate-700 bg-white border border-gray-100 py-2 rounded-lg shadow-sm">
                        ₹${p.ask.toLocaleString()}
                    </div>
                    <div class="md:hidden block text-center font-mono font-bold text-slate-700">
                        ₹${p.ask.toLocaleString()}
                    </div>
                    <div class="text-center text-xs text-gray-400 font-medium">
                        ${time}
                    </div>
                    <div class="text-center">
                        <button onclick="addToCart('${p.name}', ${displayPrice})" class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-yellow-600 transition-colors border border-transparent">
                            <i data-lucide="plus" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>`;
            });
            container.innerHTML = html;
            lucide.createIcons();
        }

        // --- CALCULATOR LOGIC ---
        function calculate() {
            if(currentRates.gold === 0) return;

            const product = document.getElementById('calc-product').value;
            const qty = document.getElementById('calc-qty').value || 1;
            let unitPrice = 0;

            if(product === 'gold10') unitPrice = currentRates.gold;
            if(product === 'gold100') unitPrice = currentRates.gold * 10;
            if(product === 'gold1') unitPrice = currentRates.gold / 10;
            if(product === 'silver1') unitPrice = currentRates.silver;

            const baseTotal = unitPrice * qty;
            const making = baseTotal * 0.01;
            const gst = (baseTotal + making) * 0.03;
            const total = baseTotal + making + gst;

            document.getElementById('calc-live-rate').innerText = `₹ ${unitPrice.toLocaleString()}`;
            document.getElementById('calc-base').innerText = `₹ ${Math.floor(baseTotal).toLocaleString()}`;
            document.getElementById('calc-making').innerText = `₹ ${Math.floor(making).toLocaleString()}`;
            document.getElementById('calc-gst').innerText = `₹ ${Math.floor(gst).toLocaleString()}`;
            document.getElementById('calc-total').innerText = `₹ ${Math.floor(total).toLocaleString()}`;
        }

        // --- EVENT LISTENERS ---
        document.getElementById('calc-product').addEventListener('change', calculate);
        document.getElementById('calc-qty').addEventListener('input', calculate);

        document.getElementById('inquiryForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'Sending...';
            btn.disabled = true;

            const payload = {
                name: document.getElementById('req-name').value,
                phone: document.getElementById('req-phone').value,
                requirement: document.getElementById('req-msg').value,
                basket: cart, // Including the basket object explicitly
                address: "Website Inquiry"
            };

            try {
                await fetch('   https://superstylish-kristi-fluky.ngrok-free.dev', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                });
                alert('Inquiry Sent Successfully! We have received your basket details.');
                e.target.reset();
                // Clear cart after successful submission
                cart = [];
                updateCartUI();
            } catch(err) {
                alert('Message sent locally (Server offline). Basket details included in message.');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });

        // Init
        route(null, 'home');
        setInterval(fetchRates, 2000); // Live update
        fetchRates();

