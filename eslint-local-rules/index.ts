import noHardcodedColors from './no-hardcoded-colors'
import composableMustUseVue from './composable-must-use-vue'
import noLetInDescribe from './no-let-in-describe'
import extractConditionVariable from './extract-condition-variable'
import repositoryTrycatch from './repository-trycatch'

export default {
  rules: {
    'no-hardcoded-colors': noHardcodedColors,
    'composable-must-use-vue': composableMustUseVue,
    'no-let-in-describe': noLetInDescribe,
    'extract-condition-variable': extractConditionVariable,
    'repository-trycatch': repositoryTrycatch,
  },
}
