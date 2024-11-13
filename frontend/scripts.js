document.addEventListener('DOMContentLoaded', () => {
    // Get the username from the query parameter in the URL (e.g., ?username=elias1013)
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');  // Get username from the query parameter

    if (username) {
        // Fetch data from the backend
        fetch(`/dashboard?username=${username}`)
            .then(response => {
                if (!response.ok) {
                    //throw new Error('User not found or error fetching data');
                }
                return response.json();
            })
            .then(data => {
                // Create and append a new h2 element containing the username
                const usernameElement = document.createElement('h2');
                usernameElement.textContent = `Hello, ${username}`;
                usernameElement.classList.add('user-data');
                usernameElement.id = 'profile-name'
                // Adding common class
                const widgetElement = document.querySelector('.widget'); // Select first widget element
                const profile_box = document.getElementById("profile");

                

                if (widgetElement) {
                    profile_box.appendChild(usernameElement);
                }

                // Ensure deposits and transactions are numbers
                const deposits = data.deposits.map(deposit => parseFloat(deposit));
                const transactions = data.transaction.map(trans => parseFloat(trans));

                // Calculate income (total of deposits) and spending (total of transactions)
                const income = deposits.reduce((acc, deposit) => acc + deposit, 0);
                const spending = transactions.reduce((acc, trans) => acc + trans, 0);

                // Format as fixed decimal values
                let spentval = spending.toFixed(2);
                let incomeval = income.toFixed(2);

                // Create and append other h2 elements containing the data
                const balanceElement = document.createElement('h2');
                balanceElement.textContent = `$${(income - spending).toFixed(2)}`;
                balanceElement.classList.add('user-data');  // Adding common class
                document.getElementById('balance').appendChild(balanceElement);  // Assuming 'balance' exists

                const incomeElement = document.createElement('h2');
                incomeElement.textContent = `$${income.toFixed(2)}`;
                incomeElement.classList.add('user-data');
                document.getElementById('money-in').appendChild(incomeElement);  // Assuming 'money-in' exists

                const spendingElement = document.createElement('h2');
                spendingElement.textContent = `$${spending.toFixed(2)}`;
                spendingElement.classList.add('user-data');
                document.getElementById('money-out').appendChild(spendingElement);  // Assuming 'money-out' exists

                // Optionally, you can calculate "Save vs Spending" and "Spend to Income Ratio"
                const saveVsSpending = income - spending;
                const saveVsSpendingElement = document.createElement('h2');
                saveVsSpendingElement.textContent = `$${saveVsSpending.toFixed(2)}`;
                saveVsSpendingElement.classList.add('user-data');
                document.getElementById('svs').appendChild(saveVsSpendingElement);  // Assuming 'svs' exists

                const spendToIncomeRatio = income > 0 ? (spending / income) : 0;
                const stirElement = document.createElement('h2');
                stirElement.textContent = `${(spendToIncomeRatio * 100).toFixed(2)}%`;
                stirElement.classList.add('user-data');
                document.getElementById('stir').appendChild(stirElement);  // Assuming 'stir' exists

                // happy or sad img
                let thumbsup = document.createElement('img');
                thumbsup.classList.add("thumbsimg");
                thumbsup.src = '/images/thumbsup.png';

                let thumbsdown = document.createElement('img');
                thumbsdown.classList.add("thumbsimg");
                thumbsdown.src = '/images/thumbsdown.png';

                // Conditional check for the Spend to Income Ratio
                if ((spendToIncomeRatio * 100).toFixed(2) > 60) {
                    document.getElementById('stir').appendChild(thumbsdown);
                    console.log("bad stir");
                } else {
                    document.getElementById('stir').appendChild(thumbsup);
                    console.log("good stir");
                }


                 // Create and append h2 element to "reward-count" div
                 const rewardCountElement = document.createElement('h2');
                 //increment coins
                 if(saveVsSpending <=60 ){
                    data.rewardCount =  data.rewardCount + 1
                 }
                 rewardCountElement.textContent = `Your Reward Count: ${data.rewardCount || 0}`;
                 
                 // Assuming rewardCount is part of the response data
                 rewardCountElement.classList.add('reward-data');
                 document.getElementById('reward-count').appendChild(rewardCountElement); // Assuming 'reward-count' exists

            })
            .catch(error => {
                console.error('Error:', error);
                // Optionally, show an error message to the user
                //alert('Error fetching data. Please check your username and try again.');
            });
    } else {
        alert('No username provided in the URL.');
    }
});
