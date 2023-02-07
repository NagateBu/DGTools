#!/usr/bin/env node

const {program} = require("commander");
const chalk = require("chalk");

const Tools = require("./tools.js")
const {version} = require("../package.json");

/**
 * 查看当前版本
 */
program.version(chalk.blue(version));

/**
 * 查看帮助
 */
program.on("--help", () => {
    console.log();
    console.log(`Run ${chalk.cyan(`works <command> --help`,)} for detailed usage of given command.`,);
    console.log();
});

/**
 * 打包
 */
program
    .command("build")
    .description(chalk.yellow("打包插件"))
    .action(({watch}) => {
        try {
            const tools = new Tools()
            tools.build()
        } catch (e) {
            console.log(chalk.red(e))
        }
    });

/**
 * 运行
 */
program
    .command("dev")
    .description("开发模式")
    .action(() => {
        try {
            const tools = new Tools()

            tools.dev()
        } catch (e) {
            console.log(chalk.red(e))
        }
    })

/**
 * 创建模版
 */
program
    .command("create <pluginName>")
    .description("创建插件")
    .action((pluginName) => {
        const tools = new Tools()
        tools.create(pluginName)
    })

/**
 * 解析命令行
 */
program.parse(process.argv);
