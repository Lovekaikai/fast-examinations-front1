const fs = require('fs')
const path = require('path')
const Mock = require('mockjs')// mockjs 导入依赖模块
const bodyParser = require('body-parser');

// 读取json文件
function getJsonFile(filePath) {
    // 读取指定json文件
    var json = fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8')
    // 解析并返回
    return JSON.parse(json)
}

// 返回一个函数
module.exports = function (app) {
    if (process.env.MOCK == 'true') {
        app.use(bodyParser.json());//数据JSON类型
        // 监听http请求
        app.post('/login', function (req, res) {
            // console.log(req.body);
            // 每次响应请求时读取mock data的json文件

            let account = req.body.account
            let password = req.body.password
            let json = ''
            if (account === 'admin' && password === '123456') {
                // getJsonFile方法定义了如何读取json文件并解析成数据对象
                json = getJsonFile('./userInfo1.json')
            } else if (account === 'zhangsan' && password === '123456') {
                json = getJsonFile('./userInfo2.json')
            } else {
                json = getJsonFile('./error.json')
            }

            // 将json传入 Mock.mock 方法中，生成的数据返回给浏览器
            res.json(Mock.mock(json))
        })

        app.post('/userOrganization/list', function (req, res) {
            let json = getJsonFile('./userOrganization.json')
            res.json(Mock.mock(json))
        })

        app.get('/area/tree',function(req,res) {
            let json = getJsonFile('./tree.json')
            res.json(Mock.mock(json))
        })

        app.post('/userAccount/list',function(req,res) {
            let json = getJsonFile('./accoutList.json')
            res.json(Mock.mock(json))
        })

        app.get('/userOrganization/pull',function(req,res) {
            let json = getJsonFile('./organizationPull.json')
            res.json(Mock.mock(json))
        })

        app.get('/detectionClassification/classificationPage', function (req, res) {
            let json = getJsonFile('./categoryInspec.json')
            
            res.json(Mock.mock(json))
        })

        app.get('/detectionMethod/getPage', function (req, res) {
            let json = getJsonFile('./detectionMethod.json')
            res.json(Mock.mock(json))
        })
    }
}