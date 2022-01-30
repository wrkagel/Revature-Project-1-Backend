# Expense Reimbursement Backend Server
## ***\*This project is for learning purposes only and does not include security implementations or all features necessary for a true expense-reimbursement system backend***
- This is an express server that functions as the backend to an expense-reimbursement system.
- See [Revature-Project-1-Frontend](https://github.com/wrkagel/Revature-Project-1-Frontend) for the associated frontend code.
- See [Revature-Project-1-Mobile](https://github.com/wrkagel/Revature-Project-1-Mobile) for the associated mobile application code.

## How to use
- Server is hosted on Azure's App Service and the functionality can be viewed by using the associated frontend. 
  - [***see frontend repository for link***](https://github.com/wrkagel/Revature-Project-1-Frontend)
- To use locally you will need to have your own database that the backend can communicate with, the cors origin will need to be changed, and the connection strings and methods in the DAOs would need to be changed to use your database.

## Functionality
- Handles login authentication for both browser and mobile frontend applications.
- Create Reimbursements.
- Update Reimbursements.
- Get Reimbursements.
- Get list of managed employees for managers.
- Creates statistics based off of all reimbursements and managed employees reimbursements.