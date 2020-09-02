const AWS = require("aws-sdk");

export default class Testers {
  static instance = null;

  _testers = "";

  /**
   * @returns {Testers}
   */
  static getInstance() {
    if (Testers.instance == null) {
      Testers.instance = new Testers();
    }

    return this.instance;
  }

  getTesters() {
    return this._testers;
  }

  setTesters(testerList) {
    let testers = [];
    for (let i = 0; i < testerList.length; i++) {
      const item = testerList[i];
      testers.push({
        asurite: item.asurite.S,
        isActive: item.isActive.BOOL
      });
    }
    this._testers = testers;
  }
}
