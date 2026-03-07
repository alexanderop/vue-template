import noHardcodedColors from './no-hardcoded-colors.mjs'
import composableMustUseVue from './composable-must-use-vue.mjs'
import noLetInDescribe from './no-let-in-describe.mjs'
import extractConditionVariable from './extract-condition-variable.mjs'
import repositoryTrycatch from './repository-trycatch.mjs'
import noEnum from './no-enum.mjs'
import noElse from './no-else.mjs'
import noTryStatement from './no-try-statement.mjs'

export default {
  meta: { name: 'local', version: '0.0.0' },
  rules: {
    'no-hardcoded-colors': noHardcodedColors,
    'composable-must-use-vue': composableMustUseVue,
    'no-let-in-describe': noLetInDescribe,
    'extract-condition-variable': extractConditionVariable,
    'repository-trycatch': repositoryTrycatch,
    'no-enum': noEnum,
    'no-else': noElse,
    'no-try-statement': noTryStatement,
  },
}
