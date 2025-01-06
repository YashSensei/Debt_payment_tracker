document.addEventListener('DOMContentLoaded', () => {
    let debts = JSON.parse(localStorage.getItem('debts')) || [];
    const addDebtForm = document.getElementById('addDebtForm');
    const payDebtForm = document.getElementById('payDebtForm');
    const debtsList = document.getElementById('debtsList');
    const debtSelect = document.getElementById('debtSelect');
    const totalDebtsEl = document.getElementById('totalDebts');
    const totalPaidEl = document.getElementById('totalPaid');
    const totalRemainingEl = document.getElementById('totalRemaining');

    function updateSummary() {
        const summary = debts.reduce((acc, debt) => {
            acc.total += debt.amount;
            acc.paid += debt.paid;
            acc.remaining += (debt.amount - debt.paid);
            return acc;
        }, { total: 0, paid: 0, remaining: 0 });

        totalDebtsEl.textContent = `₹${summary.total}`;
        totalPaidEl.textContent = `₹${summary.paid}`;
        totalRemainingEl.textContent = `₹${summary.remaining}`;
    }

    function updateDebtsDisplay() {
        debtsList.innerHTML = '';
        debtSelect.innerHTML = '<option value="">Select Debt</option>';

        if (debts.length === 0) {
            debtsList.innerHTML = `
                <div class="no-debts">
                    <div class="celebration">
                        <i class="fas fa-trophy"></i>
                        <h3>Congratulations!</h3>
                        <p>You don't have any debts!</p>
                        <div class="confetti">🎉 🎊 🎈</div>
                    </div>
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
                
                const progress = (debt.paid / debt.amount) * 100;
                debtsList.innerHTML += `
                    <div class="debt-card">
                        <h3>${debt.description}</h3>
                        <div class="debt-details">
                            <p><i class="fas fa-money-bill"></i> Total: ₹${debt.amount}</p>
                            <p><i class="fas fa-check-circle"></i> Paid: ₹${debt.paid}</p>
                            <p><i class="fas fa-hourglass-half"></i> Remaining: ₹${remaining}</p>
                        </div>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${progress}%"></div>
                        </div>
                    </div>
                `;
            }
        });

        updateSummary();
        updateQuickStats();
    }

    addDebtForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = e.target[0].value;
        const amount = parseFloat(e.target[1].value);
        
        debts.push({
            description,
            amount,
            paid: 0,
            date: new Date().toISOString()
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
                showCelebration(debts[debtIndex].description);
            }
            
            localStorage.setItem('debts', JSON.stringify(debts));
            updateDebtsDisplay();
            e.target.reset();
        }
    });

    function showCelebration(debtName) {
        const celebration = document.createElement('div');
        celebration.className = 'celebration-overlay';
        celebration.innerHTML = `
            <div class="celebration-content">
                <i class="fas fa-trophy celebration-icon"></i>
                <h2>Congratulations!</h2>
                <p>You've completely paid off:</p>
                <h3>${debtName}</h3>
                <div class="confetti">🎉 🎊 🎈</div>
            </div>
        `;
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
        }, 5000);
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = darkModeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });

    // Export data
    const exportData = document.getElementById('exportData');
    exportData.addEventListener('click', () => {
        // Create CSV headers
        const headers = ['Description', 'Total Amount', 'Paid Amount', 'Remaining', 'Status', 'Date Added'];
        
        // Format each debt row
        const rows = debts.map(debt => {
            const remaining = debt.amount - debt.paid;
            const status = remaining <= 0 ? 'Completed' : 'Active';
            return [
                debt.description,
                debt.amount,
                debt.paid,
                remaining,
                status,
                new Date(debt.date).toLocaleDateString()
            ];
        });

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debt-tracker-export-${new Date().toLocaleDateString()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Update quick stats
    function updateQuickStats() {
        const activeDebts = debts.filter(debt => debt.amount > debt.paid);
        const completedDebts = debts.filter(debt => debt.amount <= debt.paid);
        document.getElementById('activeDebtsCount').textContent = activeDebts.length;
        document.getElementById('completedDebtsCount').textContent = completedDebts.length;
    }

    // Delete all records
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    deleteAllBtn.addEventListener('click', () => {
        if (debts.length === 0) {
            alert('No records to delete!');
            return;
        }
        
        const confirmed = confirm('Are you sure you want to delete all debt records? This action cannot be undone.');
        if (confirmed) {
            debts = [];
            localStorage.setItem('debts', JSON.stringify(debts));
            updateDebtsDisplay();
            const reloadConfirm = confirm('All records have been deleted successfully. The page needs to be reloaded for changes to take effect. Reload now?');
            if (reloadConfirm) {
                window.location.reload();
            }
        }
    });

    updateDebtsDisplay();
}); 