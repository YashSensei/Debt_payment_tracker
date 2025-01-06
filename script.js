document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Modal handling
    const modal = document.getElementById('trackingModal');
    const startTrackingBtn = document.getElementById('startTracking');
    const closeBtn = document.querySelector('.close');

    startTrackingBtn.onclick = () => modal.style.display = "block";
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => {
        if (e.target == modal) modal.style.display = "none";
    }

    // Tab system
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Debt tracking functionality
    let debts = JSON.parse(localStorage.getItem('debts')) || [];
    const addDebtForm = document.getElementById('addDebtForm');
    const payDebtForm = document.getElementById('payDebtForm');
    const debtsList = document.getElementById('debtsList');
    const debtSelect = document.getElementById('debtSelect');

    function updateDebtsDisplay() {
        debtsList.innerHTML = '';
        debtSelect.innerHTML = '<option value="">Select Debt</option>';

        if (debts.length === 0) {
            debtsList.innerHTML = `
                <div class="no-debts">
                    <h3>🎉 Congratulations! You don't have any debts! 🎉</h3>
                </div>
            `;
            return;
        }

        debts.forEach((debt, index) => {
            const remaining = debt.amount - debt.paid;
            if (remaining > 0) {
                debtSelect.innerHTML += `
                    <option value="${index}">${debt.description} - ₹${remaining} remaining</option>
                `;
                debtsList.innerHTML += `
                    <div class="debt-item">
                        <h3>${debt.description}</h3>
                        <p>Total: ₹${debt.amount}</p>
                        <p>Paid: ₹${debt.paid}</p>
                        <p>Remaining: ₹${remaining}</p>
                    </div>
                `;
            }
        });
    }

    addDebtForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = e.target[0].value;
        const amount = parseFloat(e.target[1].value);
        
        debts.push({
            description,
            amount,
            paid: 0
        });
        
        localStorage.setItem('debts', JSON.stringify(debts));
        updateDebtsDisplay();
        e.target.reset();
    });

    payDebtForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const debtIndex = parseInt(e.target[0].value);
        const payment = parseFloat(e.target[1].value);
        
        if (debtIndex >= 0) {
            debts[debtIndex].paid += payment;
            const remaining = debts[debtIndex].amount - debts[debtIndex].paid;
            
            if (remaining <= 0) {
                alert(`🎉 Congratulations! You've completely paid off the debt: ${debts[debtIndex].description}! 🎉`);
            }
            
            localStorage.setItem('debts', JSON.stringify(debts));
            updateDebtsDisplay();
            e.target.reset();
        }
    });

    // Only keep the UPI copy functionality
    const copyUPIBtn = document.getElementById('copyUPI');
    
    copyUPIBtn.addEventListener('click', () => {
        const upiId = document.querySelector('.upi-id').textContent;
        navigator.clipboard.writeText(upiId).then(() => {
            const originalText = copyUPIBtn.innerHTML;
            copyUPIBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyUPIBtn.innerHTML = '<i class="fas fa-copy"></i> Copy UPI ID';
            }, 2000);
        });
    });

    // Initial debts display
    updateDebtsDisplay();

    // Fade-in animation for sections
    const sections = document.querySelectorAll('.section');
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
});
