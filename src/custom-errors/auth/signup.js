class PasswordError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PasswordError';
        this.invalidFields = ['user-password-field'];
    }
}

class PasswordMismatchError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PasswordMismatchError';
        this.invalidFields = ['user-password-field', 'user-cnf-password-field'];
    }
}

class NameError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NameError';
        this.invalidFields = ['user-name-field'];
    }
}

class EmailError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EmailError';
        this.invalidFields = ['user-email-field'];
    }
}

module.exports = {
    PasswordError,
    PasswordMismatchError,
    NameError,
    EmailError
};
