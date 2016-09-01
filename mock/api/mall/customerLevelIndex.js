var Mock = require('mockjs');

var data = Mock.mock({
  "status": "0",
  "result": {
      "name": "@cname",
      "avatar": "@image('750x750')",
      "myVipLevel": {
        "name": "普通会员",
        "discount": "10",
        "level": 1
      },
      "allLevel|4": [{
        "name|+1": [
          "普通会员",
          "黄金会员",
          "铂金会员",
          "钻石会员",
        ],
        "discount|+1": ['9','8','7','6'],
        "level|+1": 1
      }]
  }
})

module.exports = JSON.stringify(data, null, 4);
