import Vue, { VNode } from 'vue'

declare global {
    namespace JSX {
        // tslint:disable no-empty-interface
        type Element = VNode
        // tslint:disable no-empty-interface
        type ElementClass = Vue
        interface IntrinsicElements {
            [elem: string]: any
        }
    }
    type Type1 = {}
}
// 当声明文件里面有import引入的时候，必须放在global里面才可生效
type Type3 = {}
