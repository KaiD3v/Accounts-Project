// External modules
import inquirer from "inquirer";
import chalk from "chalk";

// Internal modules
import fs, { access } from "fs";

// Code

console.log("inciando accounts");

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar Conta",
          "Consultar Saldo",
          "Transferir Dinheiro",
          "Depositar",
          "Sacar",
          "Deletar Conta",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];

      if (action === "Criar Conta") {
        createAccount();
      } else if (action === "Depositar") {
        deposit();
      } else if (action === "Consultar Saldo") {
        getAccountBalance();
      } else if (action === "Sacar") {
        withDraw();
      } else if (action === "Transferir Dinheiro") {
        moneyTransition();
      } else if (action === "Sair") {
        console.log(chalk.bgBlue.black("Obrigado por usar o Acconuts!"));
        process.exit();
      } else if (action === "Deletar Conta") {
        deleteAccount();
      }

      console.log(action);
    })
    .catch((err) => console.log(err));
}

// create an account
function createAccount() {
  console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco!"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));

  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite um nome para a sua conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      console.info(accountName);

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black("Esta conta já existe, escolha outro nome!")
        );
        buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance":0}',
        function (err) {
          console.log(err);
        }
      );

      console.log(chalk.green("Parabéns! A sua conta foi criada."));
      operation();
    })
    .catch((err) => console.log(err));
}

// add an ammount to user account
function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      // verify if account exists
      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja depositar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];

          // add an amount
          addAmount(accountName, amount);
          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(
      chalk.bgRed.black("Esta conta não existe! Escolha outro nome.")
    );
    return false; // Retorna false se o arquivo não existe
  }

  return true; // Retorna true se o arquivo existe
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro! Tente novamente mais tarde.")
    );
    return deposit;
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`)
  );
}

function getAccount(accountName) {
  try {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
      encoding: "utf8",
      flag: "r",
    });

    return JSON.parse(accountJSON);
  } catch {
    (err) => console.log(`Houve um erro Interno! Tente novamente.`);
  }
}

// Show account balance
function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName) && balance === undefined) {
        return;
      }

      const accountData = getAccount(accountName);

      console.log(
        chalk.bgBlue.black(
          `Olá! O saldo da sua conta é de R$${accountData.balance}`
        )
      );
      operation();
    })
    .catch((err) => console.log(err));
}

// withdraw amount from user account
function withDraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return;
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Digite o valor do saque",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];

          removeAmount(accountName, amount);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    );
    return withDraw();
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black("Valor insuficiente!"));
    return withDraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (err) => {
      console.log(err);
    },

    console.log(chalk.green(`Foi realizado o saque no valor de $${amount}!`))
  );
  operation();
}

// Delete an account

function deleteAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite a conta que deseja deletar",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      try {
        fs.unlinkSync(`accounts/${accountName}.json`);
        console.log(`Arquivo ${accountName} excluído com sucesso!`);
      } catch (error) {
        console.error(`Erro ao excluir o arquivo: ${error.message}`);
      }
    })
    .catch((err) => console.log("tente novamente", deleteAccount()));
}

// Transfers money between accounts

function moneyTransition() {
  let firstAccount;
  let secondAccount;

  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite a conta que realizará a transferência",
      },
    ])
    .then((firstAnswer) => {
      firstAccount = firstAnswer["accountName"];

      if (!checkAccount(firstAccount)) {
        return moneyTransition();
      }

      return inquirer.prompt([
        {
          name: "accountName",
          message: "Digite a conta que receberá a transferência",
        },
      ]);
    })
    .then((secondAnswer) => {
      secondAccount = secondAnswer["accountName"];

      const firstAccountData = getAccount(firstAccount);
      const secondAccountData = getAccount(secondAccount);

      return inquirer.prompt([
        {
          name: "amount",
          message: "Digite o valor da transferência",
        },
      ]);
    })
    .then((amountAnswer) => {
      const amount = amountAnswer["amount"];

      if (!amount || parseFloat(amount) <= 0) {
        console.log(chalk.bgRed.black("Valor inválido para a transferência."));
        return moneyTransition();
      }

      const firstAccountData = getAccount(firstAccount);
      const secondAccountData = getAccount(secondAccount);

      if (firstAccountData.balance < amount) {
        console.log(chalk.bgRed.black("Saldo insuficiente para a transferência."));
        return moneyTransition();
      }

      // Perform the transfer between the accounts
      removeAmount(firstAccount, amount);
      addAmount(secondAccount, amount);

      console.log(chalk.green(`Transferência realizada com sucesso: R$${amount}`));
      operation();
    })
    .catch((err) => console.log(err));
}