require("dotenv").config()
const util = require("util")
global.tlib = require("../test/lib/_testlib")

const commander = require("commander")

commander
  .version("1.0.0")
  .option("-c, --component <component_name>", "Component to test")
  .option("-t, --test <test_name>", "Test suite name")
  .option("-s, --scenario <scenario_name>", "Scenario name")
  .parse(process.argv)


const runScenario = async () => {

  const testSuite = require(`../test/tests/${commander.component}/${commander.test}/${commander.test}_scenarios.js`)
  await tlib.init()
  await lib.init()
  console.log("Running", commander.test, commander.scenario)
  const result = await testSuite[commander.scenario]()
  console.log("Test result", util.inspect(result, {depth: 20, colors: true}))
  await lib.cleanup()
  process.exit(0)
}

runScenario()
