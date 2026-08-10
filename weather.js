var name = "";
var host = "";
var key  = "";

(function () {
    var args = $argument;
    if (args) {
        name = args.name != null ? String(args.name) : name;
        host = args.host != null ? String(args.host) : host;
        key  = args.key  != null ? String(args.key)  : key;
    }
})();

function get(url) {
    return new Promise(function (back) {
        function request(num) {
            $httpClient.get({
                url: url,
                timeout: 5000,
                headers: {
                    "Accept": "application/json",
                    "Accept-Encoding": "gzip",
                    "Host": host,
                    "X-QW-Api-Key": key,
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15"
                }
            }, function (error, response, body) {

                if (!error && body) {
                    back(JSON.parse(body));
                    return;
                }
                if (num < 2) {
                    request(num + 1);
                    return;
                }
                var log = "请求失败HTTP:" + error;
                console.log(log);
                $notification.post("天气通知", "", log);
                $done();
            });
        }
        request(1);

    });
}

(async function () {

    var data = await get("https://" + host + "/geo/v2/city/lookup?location=" + encodeURIComponent(name));
    var loca = data.location[0];

    var wdat = await get("https://" + host + "/weather/v1/current/" + loca.lat + "/" + loca.lon);
    var adat = await get("https://" + host + "/weatheralert/v1/current/" + loca.lat + "/" + loca.lon);

    var text = "天气预警";

    var rain = wdat.precipitation.amount.value > 0 ? " 降水" + wdat.precipitation.amount.value + "mm" : "";
    var wind = wdat.wind.scale > 0 ? " 风力" + wdat.wind.scale + "级" : "";
    var cont = "当前" + wdat.condition.text + " 气温" + Math.round(wdat.temperature.value) + "°" + " 体感" + Math.round(wdat.feelsLike.value) + "°" + " 湿度" + Math.round(wdat.humidity * 100) + "%" + wind + rain;

    if (adat.alerts && adat.alerts[0]) {
        var desc = adat.alerts[0].description;
        if (desc) {
            cont += (desc ? "\n" + desc : "");
        }
    }

    console.log(text + "\n\n" + cont);
	
    $notification.post(text, "", cont, { mediaUrl: icon(wdat.condition.text, new Date().getHours())});

    $done();

})();

function icon(text, hour) {
    var night = hour >= 19 || hour < 5;
	
    if (night && /雨|阵雨|小雨|中雨|大雨|暴雨|毛毛雨|细雨/.test(text))
        return "https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC43862495245036393/zh_HK/d4b6596291c114305b64056bd92ccee3.png";
    if (night && /晴|晴朗/.test(text))
        return "https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC39FA1A6D6FA0F620C/zh_CN/1200cde3569cf69bd80e1ddabc0f15cd.png";
    if (night && /少云|多云|云|阴|阴天/.test(text))
        return "https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC39FA1A6D6FA0F620C/zh_CN/17cc1a8a95028b89ba6988ee47eeab29.png";
    
	if (/雷|雷雨|雷阵雨|强雷雨|雷电/.test(text))
        return "https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC39FA1A6D6FA0F620C/zh_CN/efffb1e26f6de5bf5c8adbd872a2933a.png";
    if (/雪|小雪|中雪|大雪|暴雪|阵雪|雨夹雪|冻雨/.test(text))
        return "https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC39FA1A6D6FA0F620C/zh_CN/9189cb49e806d1ebfeed24f33367143c.png";
    if (/雨|小雨|中雨|大雨|暴雨|阵雨|毛毛雨|细雨|降雨/.test(text))
        return "https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC39FA1A6D6FA0F620C/zh_CN/451d37e6cea3af4a568110863a1adcf7.png";
    if (/雾|霾|轻雾|浓雾|大雾|霭/.test(text))
        return "https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC39FA1A6D6FA0F620C/zh_CN/d35bb25d12281cd9ee5ce78a98cd2aa7.png";
    if (/风|大风|狂风|扬沙|沙尘暴/.test(text))
        return "https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC39FA1A6D6FA0F620C/zh_CN/ad9e41c68b6a2671d2bcd843be1baa86.png";
    if (/晴|晴朗/.test(text))
        return "https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC39FA1A6D6FA0F620C/zh_CN/575900edccbc7def167f7874c02aeb0b.png";
    if (/少云|多云|云|疏云|间晴/.test(text))
        return "https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC39FA1A6D6FA0F620C/zh_CN/67aaf9dbe30989c25cbde6c6ec099213.png";
    if (/阴|阴天|阴沉|灰霾/.test(text))
        return "https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC39FA1A6D6FA0F620C/zh_CN/66117fab0f288a2867b340fa2fcde31b.png";

    return "";
}
