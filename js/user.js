"use strict";

(function (core) {
  class User {
    constructor(displayName = "", username = "", password = "") {
      this._displayName = displayName;
      this._username = username;
      this._password = password;
    }

    get displayName() {
      return this._displayName;
    }

    get username() {
      return this._username;
    }

    set displayName(displayName) {
      return (this._displayName = displayName);
    }

    set username(username) {
      return (this._username = username);
    }

    toString() {
      return `Display Name: ${this._displayName}
            \nUsername: ${this._username}`;
    }

    toJSON() {
      return {
        DisplayName: this._displayName,
        Username: this._username,
        Password: this._password,
      };
    }

    fromJSON(data) {
      this._displayName = data.DisplayName;
      this._username = data.Username;
      this._password = data.Password;
    }

    serialize() {
      if (this._displayName !== "" && this._username !== "") {
        return `${this._displayName}, ${this._username}`;
      }
      console.error(
        "[ERROR] Failed to serialize. One or more user properties are missing"
      );
      return null;
    }

    deserialize(data) {
      let propertyArray = data.split(",");
      this._displayName = propertyArray[0];
      this._username = propertyArray[1];
    }
  }

  core.User = User;
})(core || (core = {}));
