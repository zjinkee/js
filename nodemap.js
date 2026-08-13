var node = $environment.params.nodeInfo.name;

$httpClient.get({
    url:"http://ip-api.com/json/?lang=zh-CN",
    timeout:5000,
    node:node
}, function(error,response,body){

    if(error){
        $done({
            title:"请求失败",
            htmlMessage:`<p style="font-family:-apple-system;font-size:13px;color:#8659E8;">原因：${error}</p>`
        });
        return;
    }

    var json=JSON.parse(body);

    var host=$environment.params.nodeInfo.address;
    host=host.split(":")[0];


    $httpClient.get({
        url:"https://223.5.5.5/resolve?name="+host+"&type=A",
        timeout:3000,
        headers:{
            "Accept":"application/dns-json"
        }
    },function(error,response,body){

        var dns=JSON.parse(body);
        var ip = dns.Answer && dns.Answer.length > 0 
            ? dns.Answer[0].data 
            : null;


        $httpClient.get({
            url:"http://ip-api.com/json/"+ip+"?lang=zh-CN",
            timeout:5000
        },function(error,response,body){

            var ip=JSON.parse(body);
            var region=new Intl.DisplayNames(['zh-CN'],{
                type:'region'
            });


            var html=`
<p style="text-align:center;font-family:-apple-system;line-height:1.5;">
<br>

<span style="font-size:14px;font-weight:500;color:#FF9500;">入口位置</span><br>
<span style="font-size:15px;">IP：${ip.query}</span><br>
<span style="font-size:14px;">位置：${region.of(ip.countryCode)} ${ip.city}</span><br>
<span style="font-size:14px;">服务：${ip.isp}</span><br><br>

<span style="font-size:14px;font-weight:500;color:#007AFF;">落地位置</span><br>
<span style="font-size:15px;">IP：${json.query}</span><br>
<span style="font-size:14px;">位置：${region.of(json.countryCode)} ${json.city}</span><br>
<span style="font-size:14px;">服务：${json.isp}</span><br><br>

<span style="font-size:14px;font-weight:500;color:#8659E8;">节点：${node}</span>

</p>`;

            $done({
                title:"查询结果",
                htmlMessage:html
            });


        });

    });

});
