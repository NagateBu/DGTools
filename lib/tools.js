const fs = require("fs");
const fse = require('fs-extra')
const http = require("http")
const path = require('path')
const tools = require("rollup");
const copy = require("rollup-plugin-copy");
const clear = require("rollup-plugin-clear");
const chalk = require("chalk");
const mustache = require("mustache")
const inquirer = require("inquirer")

// 定义工具类
function Tools() {
}

// 开发模式
Tools.prototype.dev = function () {
    const server = http.createServer(function (req, res) {
        const fileName = path.resolve("." + req.url)
        const extName = path.extname(fileName).slice(1)

        const mineTypeMap = {
            js: "text/javascript",
        }

        // 仅支持 js 文件
        if (mineTypeMap[extName] && fs.existsSync(fileName)) {
            res.setHeader('Content-Type', mineTypeMap[extName]);
            const stream = fs.createReadStream(fileName);
            stream.pipe(res);
        }
    })

    server.listen("3380")

    console.log('')
    console.log(`javascript file server: ${chalk.blue('http://127.0.0.1:3380')}`)
    console.log('')

    tools.watch({
        input: "index.js",
        plugins: [
            clear({
                targets: ['dist']
            }),
            copy({
                targets: [
                    {
                        src: "static/*.*",
                        dest: "dist/static",
                    },
                    {
                        src: "icon.png",
                        dest: "dist"
                    },
                    {
                        src: "plugin.json",
                        dest: "dist"
                    }
                ],
            }),
        ],
        output: [
            {
                format: "iife",
                file: "dist/renderer.js",
            },
        ],
    });
}

// 生产环境
Tools.prototype.build = async function () {
    const bundle = await tools.rollup({
        input: "index.js",
        plugins: [
            clear({
                targets: ['dist']
            }),
            copy({
                targets: [
                    {
                        src: "static/*.*",
                        dest: "dist/static",
                    },
                    {
                        src: "icon.png",
                        dest: "dist"
                    },
                    {
                        src: "plugin.json",
                        dest: "dist"
                    }
                ],
            }),
        ],
    });

    await bundle.write({
        format: "iife",
        file: "dist/renderer.js",
    });
}

// 创建模版
Tools.prototype.create = async function (projectName) {
    const templatePath = [
        {
            path: path.resolve(__dirname, '../template/index.text'),
            name: 'index.js'
        },
        {
            path: path.resolve(__dirname, '../template/plugin.text'),
            name: 'plugin.json'
        }
    ]
    const iconPath = {path: path.resolve(__dirname, '../static/icon.png'), name: 'icon.png'}

    const asResult = await inquirer.prompt([{
        type: "input",
        name: "pluginName",
        message: "插件ID",
        default: "test"
    }, {
        type: "input",
        name: "pluginLabel",
        message: "插件名称",
        default: "test插件"
    }, {
        type: "input",
        name: "pluginType",
        message: "插件所在分类",
        default: "test"
    }])

    for (const item of templatePath) {
        await new Promise((resolve) => {
            fs.accessSync(item.path)

            // 读取文件
            let fileStr = fs.readFileSync(item.path, {encoding: 'utf8'})

            const newFileStr = mustache.render(fileStr, asResult)

            console.log(newFileStr)
            console.log(path.resolve(`${projectName}/${item.name}`))

            fse.emptydirSync(path.resolve(`${projectName}`))

            fse.outputFile(path.resolve(`${projectName}/${item.name}`), newFileStr.toString(), err => {
                if (typeof err !== 'null') {
                    console.log(chalk.green(`Success! 生成${item.name}成功！`))
                } else {
                    console.log(chalk.red(err))
                    console.log(chalk.red(`Error：生成${item.name}失败！`))
                }
            })

            resolve()
        })
    }

    await new Promise(resolve => {
        fse.copy(path.resolve(__dirname, '../static/icon.png'), path.resolve(`${projectName}/icon.png`), err => {
            if (typeof err !== 'null') {
                console.log(chalk.green(`Success! 生成图标成功！`))
            } else {
                console.log(chalk.red(err))
                console.log(chalk.red(`Error：生成图标失败！`))
            }
            resolve()
        })
    })
}

module.exports = Tools