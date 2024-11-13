// node modules
const express = require('express');
const fs = require('fs');
const bodyparser = require('body-parser');
const path = require('path');


// db path
const DATABASE = "database.json";


// app instance
const app = express();
// port number
const PORT = 3000;


// render static html
app.use(express.static(path.join(__dirname, '..', 'frontend')));


// body parser
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));


// handle login
function handleLogin(info) {
    // Read the database
    if (fs.existsSync(DATABASE)) {
        let data = fs.readFileSync(DATABASE, 'utf-8');
        let users = JSON.parse(data);


        // Check if the username and password match
        const user = users.find(user => user.username === info.username && user.password === info.password);


        if (user) {
            console.log('Login successful');
            current_user = user;
            return true;
        } else {
            console.log('Invalid credentials');
            return false;
        }
    }
    return false;
}


// handle sign up
function handleSignup(info) {
    // get json
    let entry = {
        ...info,
        deposits: [],
        transaction: [],
        balance: 0,
        rewards_points:0
    };


    current_user = entry;


    // get path
    const path = DATABASE;


    // temp db
    let temp = [];


    // open db file
    if (fs.existsSync(path)) {
        let Filedata = fs.readFileSync(path, 'utf-8');
        temp = JSON.parse(Filedata);
    }


    // add entry to temp db
    temp.push(entry);


    // write file
    fs.writeFileSync(path, JSON.stringify(temp, null, 2), 'utf-8');


    // test
    console.log('Successfully signed up');
}


// tests
app.get('/login-page', (req, res) => {
    res.redirect("/login.html");
});


app.post('/login', (req, res) => {
    const info = req.body;


    if (handleLogin(info)) {
        // Redirect to the next page if login is successful
        res.redirect(`/dashboard.html?username=${info.username}`);
    } else {
        res.redirect('/signup.html');
    }
});


// direct to sign up page
app.get('/signup-page', (req, res) => {
    res.redirect('/signup.html');
});


// attempt sign in
app.post('/signup_user', (req, res) => {
    let userdata = req.body;
    handleSignup(userdata);
    res.redirect('login.html');
    // test
    console.log('New user:', userdata);
});


app.get('/dashboard', (req, res) => {
    // Get the username from the query parameter
    const username = req.query.username;


    // Check if username is provided
    if (!username) {
        //return res.status(400).send('No username provided');
    }


    // Read the database.json file
    fs.readFile(path.join(__dirname, 'database.json'), 'utf-8', (err, data) => {
        if (err) {
           // return res.status(500).send('Error reading database');
        }


        const database = JSON.parse(data);


        // Find the user by username
        const userAccount = database.find(user => user.username === username);


        if (userAccount) {
            // Send user account data as JSON response
            res.json({
                balance: userAccount.balance,
                deposits: userAccount.deposits,
                transaction: userAccount.transaction
            });
        } else {
            //res.status(404).send('User not found');
        }
    });
});


// add deposits and transactions
function readDatabase() {
    const data = fs.readFileSync(DATABASE, 'utf8');
    return JSON.parse(data);
}


// Helper function to write data to database.json
function writeDatabase(data) {
    fs.writeFileSync(DATABASE, JSON.stringify(data, null, 2), 'utf8');
}


// Endpoint to add deposit
app.post('/add-deposit', (req, res) => {
    const { username, amount } = req.body;


    if (!username || amount <= 0) {
        //return res.status(400).json({ error: 'Invalid data' });
    }


    let users = readDatabase();
    const userIndex = users.findIndex(user => user.username === username);


    if (userIndex === -1) {
        //return res.status(404).json({ error: 'User not found' });
    }


    // Update the deposits and balance
    users[userIndex].deposits.push(amount);
    users[userIndex].balance += amount;


    // Save the updated data
    writeDatabase(users);


    return res.json(users[userIndex]);
});


// Endpoint to add transaction
app.post('/add-transaction', (req, res) => {
    const { username, amount } = req.body;


    if (!username || amount <= 0) {
       // return res.status(400).json({ error: 'Invalid data' });
    }


    let users = readDatabase();
    const userIndex = users.findIndex(user => user.username === username);


    if (userIndex === -1) {
       // return res.status(404).json({ error: 'User not found' });
    }


    // Update the transactions and balance
    users[userIndex].transaction.push(amount);
    users[userIndex].balance -= amount;


    // Save the updated data
    writeDatabase(users);


    return res.json(users[userIndex]);
});


app.post('/update', (req, res) => {
    const { type, amount, username } = req.body; // Get the type (deposit/transaction), amount, and username


    if (!username || !amount || isNaN(amount) || amount <= 0 || !['deposit', 'transaction'].includes(type)) {
        //return res.status(400).json({ message: 'Invalid data provided.' });
    }


    // Read the database.json file
    fs.readFile('database.json', 'utf8', (err, data) => {
        if (err) {
           // return res.status(500).json({ message: 'Error reading database' });
        }


        let userData = JSON.parse(data);
        let user = userData.find(user => user.username === username);


        if (!user) {
           // return res.status(404).json({ message: 'User not found' });
        }


        // Update deposits or transactions
        if (type === 'deposit') {
            user.deposits.push(amount);
        } else if (type === 'transaction') {
            user.transactions.push(amount);
        }


        // Recalculate balance
        const totalIncome = user.deposits.reduce((acc, deposit) => acc + deposit, 0);
        const totalSpending = user.transactions.reduce((acc, trans) => acc + trans, 0);
        user.balance = totalIncome - totalSpending;


        // Save the updated data back to the file
        fs.writeFile('database.json', JSON.stringify(userData), 'utf8', (err) => {
            if (err) {
                //return res.status(500).json({ message: 'Error saving data' });
            }


            // Return the updated data (balance, income, spending)
            res.json({
                balance: user.balance,
                income: totalIncome,
                spending: totalSpending
            });
        });
    });
});

function adddeposit(user, entry) {
    const db = 'database.json';  // Path to your database file

    let temp = [];

    // Check if the database file exists
    if (fs.existsSync(db)) {
        // Read and parse the current data from the file
        let filedata = fs.readFileSync(db, 'utf-8');
        temp = JSON.parse(filedata);
    }

    // Loop through the users in the temp array
    temp.forEach(i => {
        if (i.username === user.username) {
            // Ensure deposits array exists, then push the new amount
            if (!i.deposits) {
                i.deposits = [];  // Initialize the deposits array if it doesn't exist
            }
            i.deposits.push(entry.amount);  // Add the deposit amount to the array
            console.log(`Deposit added for ${i.username}:`, entry.amount);
        }
    });

    // Write the updated data back to the database file
    fs.writeFileSync(db, JSON.stringify(temp, null, 2), 'utf-8');
}


// Express POST route for handling deposit updates
app.post('/deposit_update', (req, res) => {
    const entry = req.body; // Get the form data from the request body
    const username = req.query.username; // Access username from the request body

    console.log("username:", current_user.username)
    console.log(entry); // Log the request body to the console


    adddeposit(current_user, entry); // Call adddeposit to update the database

    // Redirect to dashboard with username as a query parameter
    res.redirect(`/dashboard.html?username=${current_user.username}`);
});

function addtransaction(user, entry) {
    const db = 'database.json';  // Path to your database file

    let temp = [];

    // Check if the database file exists
    if (fs.existsSync(db)) {
        // Read and parse the current data from the file
        let filedata = fs.readFileSync(db, 'utf-8');
        temp = JSON.parse(filedata);
    }

    // Loop through the users in the temp array
    temp.forEach(i => {
        if (i.username === user.username) {
            // Ensure transaction array exists, then push the new amount
            if (!i.transaction) {
                i.transaction = [];  // Initialize the transaction array if it doesn't exist
            }
            i.transaction.push(entry.amount);  // Add the transaction amount to the array
            console.log(`Transaction added for ${i.username}:`, entry.amount);
        }
    });

    // Write the updated data back to the database file
    fs.writeFileSync(db, JSON.stringify(temp, null, 2), 'utf-8');
}


// Express POST route for handling transaction updates
app.post('/transaction_update', (req, res) => {
    const entry = req.body; // Get the form data from the request body
    const username = req.query.username; // Access username from the request body

    console.log("username:", current_user.username)
    console.log(entry); // Log the request body to the console


    addtransaction(current_user, entry); // Call adddeposit to update the database

    // Redirect to dashboard with username as a query parameter
    res.redirect(`/dashboard.html?username=${current_user.username}`);
});





app.listen(PORT, () => {
    console.log('Backend connected!');
});


