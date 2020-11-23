class Title {
    constructor(application, document) {
        this.title = document.title;

        application.on(['lobsters-items-loaded', 'hacker-news-items-loaded'], e => {
            document.title = e.items.length > 0 ? `* ${this.title}` : this.title;
        });
    }
}   

module.exports.Title = Title;