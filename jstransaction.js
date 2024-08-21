// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzxDZs6QrRzBqH3vlBwhwSTF6OKYMvVmM",
  authDomain: "moneymeneg.firebaseapp.com",
  projectId: "moneymeneg",
  storageBucket: "moneymeneg.appspot.com",
  messagingSenderId: "945314409163",
  appId: "1:945314409163:web:285de4b07df54b7101494e",
  measurementId: "G-HDX7W5FRSP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    const openFormBtn = document.getElementById('openFormBtn');
    const setInitialBalanceBtn = document.getElementById('setInitialBalanceBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const formModal = document.getElementById('formModal');
    const transactionForm = document.getElementById('transactionForm');
    const transactionTable = document.getElementById('transactionTable').getElementsByTagName('tbody')[0];

    const totalIncomeElement = document.getElementById('totalIncome');
    const totalExpenseElement = document.getElementById('totalExpense');
    const saldoSisaElement = document.getElementById('saldoSisa');

    let transactions = {};
    let initialBalance = 0;

    // Open form modal
    openFormBtn.addEventListener('click', () => {
        formModal.style.display = 'flex';
    });

    // Close form modal
    closeFormBtn.addEventListener('click', () => {
        formModal.style.display = 'none';
    });

    // Set initial balance
    setInitialBalanceBtn.addEventListener('click', () => {
        const saldoInput = prompt("Masukkan Saldo Awal:");

        if (saldoInput) {
            initialBalance = parseFloat(saldoInput);
            set(ref(database, 'initialBalance'), initialBalance);
            alert(Saldo Awal telah diset ke Rp ${initialBalance.toLocaleString()});
            updateDashboard(); // Memperbarui sisa saldo di dashboard
        }
    });

    // Submit form and add transaction
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const timestamp = Date.now();
        const tanggal = document.getElementById('tanggal').value;
        const kategori = document.getElementById('kategori').value;
        const subKategori = document.getElementById('subKategori').value;
        const pembayaran = document.getElementById('pembayaran').value;
        const nominal = parseFloat(document.getElementById('nominal').value);
        const keterangan = document.getElementById('keterangan').value;

        const transactionData = {
            tanggal,
            kategori,
            subKategori,
            pembayaran,
            nominal,
            keterangan
        };

        set(ref(database, 'transactions/' + timestamp), transactionData);

        transactionForm.reset();
        formModal.style.display = 'none';
    });

    // Retrieve transactions and initial balance from Firebase and update table
    onValue(ref(database, 'transactions'), (snapshot) => {
        transactions = snapshot.val() || {};
        updateTransactionTable();
        updateDashboard();
    });

    // Retrieve initial balance from Firebase
    onValue(ref(database, 'initialBalance'), (snapshot) => {
        initialBalance = snapshot.val() || 0;
        updateDashboard();
    });

    // Update transaction table
    function updateTransactionTable() {
        transactionTable.innerHTML = ''; // Clear existing table data

        Object.keys(transactions).forEach(key => {
            const { tanggal, kategori, subKategori, pembayaran, nominal, keterangan } = transactions[key];

            const newRow = transactionTable.insertRow();
            newRow.innerHTML = 
                <td>${tanggal}</td>
                <td>${kategori}</td>
                <td>${subKategori}</td>
                <td>${pembayaran}</td>
                <td>Rp ${nominal.toLocaleString()}</td>
                <td>${keterangan}</td>
            ;
        });
    }

    // Update dashboard totals
    function updateDashboard() {
        let totalIncome = 0;
        let totalExpense = 0;

        Object.values(transactions).forEach(({ kategori, nominal }) => {
            if (kategori === 'Pemasukan') {
                totalIncome += nominal;
            } else if (kategori === 'Pengeluaran') {
                totalExpense += nominal;
            }
        });

        const totalBalance = initialBalance + totalIncome - totalExpense;
    console.log('Total Income:', totalIncome);
    console.log('Total Expense:', totalExpense);
    console.log('Initial Balance:', initialBalance);
    console.log('Total Balance:', totalBalance);

    totalIncomeElement.textContent = Rp ${totalIncome.toLocaleString()};
    totalExpenseElement.textContent = Rp ${totalExpense.toLocaleString()};
    saldoSisaElement.textContent = Rp ${totalBalance.toLocaleString()};
    }
});
