Module.register("forecastio", {

    defaults: {
        text: [],
        api_url: "https://api.darksky.net/forecast/"
    },

    start: function () {
        this.config.request_url = this.config.api_url + this.config.appkey + "/" + this.config.latitude + "," + this.config.longitude;
        this.sendSocketNotification("WEATHER", this.config.request_url);
    },

    getDom: function () {
        var wrapper = document.createElement("div");
        this.config.text.forEach(function (k) {
            var text = document.createElement("div");
            text.className = k.class_name;
            text.innerHTML = k.html;
            wrapper.appendChild(text);
        });

        return wrapper;
    },
    socketNotificationReceived: function (type, data) {
        this.config.text = data;
        this.updateDom();
    },
    getStyles: function () {
        return ["forecastio.css", "weather-icons.css"];
    }
});
