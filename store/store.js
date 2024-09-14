// 从 Vuex 4 中导入 createStore
import {
	createStore
} from 'vuex'
import moduleCart from '@/store/cart.js'
// 导入用户的 vuex 模块
import moduleUser from '@/store/user.js'

const store = createStore({
	modules: {
		'm_cart': moduleCart,
		// 挂载用户的 vuex 模块，访问路径为 m_user
		'm_user': moduleUser,
	}
})

export default store