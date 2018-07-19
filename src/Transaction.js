export default(bottle) => {
  bottle.constant('Transaction', class Transaction {
    constructor(data) {
      this.data = data;
      this.changes = [];
      this._replace = false;
      this.newContent = this.data.raw();
      this.state = 'open';
    }

    get replace() {
      return this._replace;
    }

    set replace(value) {
      this._replace = !!value;
    }

    revert() {
      this.state = 'reverted';
    }

    close() {
      if (this.state !== 'open') return;
      if (this.replace) {
        this.state = 'closed';
        this.data.sendReplace();
      } else {
        const oldValues = this.changes.reduce((values, change) => {
          // eslint-disable-next-line default-case
          switch (change.type) {
            case 'set':
              values.set(change.name, this.data.get(change.name));
          }
          return values;
        }, new Map());

        const newValues = this.changes.reduce((values, change) => {
          // eslint-disable-next-line default-case
          switch (change.type) {
            case 'add':
              values.set(change.name, change.value);
              break;

            case 'set':
              values.set(change.name, change.value);
              oldValues.set(change.name, this.data.get(change.name));
          }

          return values;
        }, new Map());
        this.data._content = this.newContent;
        this.state = 'closed';
        this.data.onChange({
          type: 'batch',
          oldValues,
          newValues,
        });
      }
    }

    addChange(change) {
      if (this.replace) return;

      switch (change.type) {
        case 'splice':
          this.replace = true;
          break;

        case 'delete':
          this.replace = true;
          break;

        case 'replace':
          this.replace = true;
          break;

        default:
          this.changes.push(change);
      }
    }
  });
};
