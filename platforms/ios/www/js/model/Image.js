var _Image = function (data, type) {
    this.type = type || 'photo';

    this.title = "";
    this.date = new Date();

    this.filenameFull = null;
    this.filenameThumbnail = null;

    this.size = {
        orig: {
            width: 0,
            height: 0
        },
        thumb:{
            width: 0,
            height: 0
        }
    };
    this.checked = false;

    if (data) {
        $.extend(this, data);
        // convert date string in to date object
        this.date = this.date ? new Date(this.date) : null;
        this.dateInCart = this.dateInCart ? new Date(this.dateInCart) : null;
    }
};