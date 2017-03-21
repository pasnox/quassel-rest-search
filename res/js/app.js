const senderColorHandler = new SenderColorHandler();
const mircColorHandler = new MircColorHandler();

class App {
    constructor() {
        this.navigation = new Navigation();
        this.urlBar = new UrlBar();
        this.buffers = [];

        this.loadingQuery = 0;

        this.render();
        this.urlBar.addEventListener("search", (query) => this.search(query));
        this.navigation.addEventListener("search", (query) => this.search(query));
        this.urlBar.init();
    }

    render() {
        const wrapper = document.createElement("div");
            wrapper.appendChild(this.navigation.elem);
            const results = document.createElement("div");
                results.classList.add("results");
            wrapper.appendChild(results);
        this.elem = wrapper;
        this.resultContainer = results;

        this.buffers.forEach((buffer) => this.insert(buffer));
    }

    search(query) {
        this.clear();
        this.loadingQuery++;
        const queryId = this.loadingQuery;
        load("web/search/", {query: query}).then((result) => {
            if (this.loadingQuery != queryId)
                return;

            this.buffers = result.map((buffer) => {
                return new Buffer(buffer.bufferid, buffer.buffername, buffer.networkname, buffer.messages.map((msg) => {
                    return new Context(new MessagePreview(msg.messageid, msg.time, msg.sender, msg.message, msg.preview));
                }));
            });
            this.buffers.forEach((buffer) => this.insert(buffer));
        });
        this.navigation.historyView.add(new HistoryElement(query));
        this.navigation.input.value = query;
        this.urlBar.set(query);
    }

    clear() {
        while (this.buffers.length) {
            const buffer = this.buffers.pop();
            this.resultContainer.removeChild(buffer.elem);
        }
    }

    clearAll() {
        this.clear();
        this.navigation.historyView.clear();
        this.urlBar.clear();
    }

    insert(buffer) {
        this.resultContainer.appendChild(buffer.elem);
    }
}

const app = new App();
document.body.insertBefore(app.elem, document.body.firstChild);