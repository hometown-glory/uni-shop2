<template>
	<view class="login-container">
		<!-- 提示登录的图标 -->
		<uni-icons type="contact-filled" size="100" color="#AFAFAF"></uni-icons>
		<!-- 登录按钮 -->
		<button type="primary" class="btn-login" @click="getUserProfile">一键登录</button>
		<!-- 登录提示 -->
		<view class="tips-text">登录后尽享更多权益</view>
	</view>

</template>

<script>
	import {
		mapMutations
	} from 'vuex'

	export default {
		name: "my-login",
		data() {
			return {

			};
		},
		computed: {
			// 调用 mapState 辅助方法，把 m_user 模块中的数据映射到当前用组件中使用
			...mapState('m_user', ['redirectInfo']),
		},
		methods: {
			// 2. 调用 mapMutations 辅助方法，把 m_user 模块中的 updateUserInfo 和 updateToken 映射到当前组件中使用
			...mapMutations('m_user', ['updateUserInfo', 'updateToken', 'updateRedirectInfo']),

			// 获取微信用户的基本信息
			getUserProfile() {
				uni.getUserProfile({
					desc: '用于完善会员资料',
					success: (res) => {
						// 获取用户信息成功后，还需要获取登录凭证（code）
						uni.login({
							provider: 'weixin',
							success: (loginRes) => {
								// 将登录凭证（code）添加到用户信息中
								const userInfo = Object.assign({}, res.userInfo, {
									code: loginRes.code
								});
								this.getUserInfo(userInfo);
							},
							fail: (err) => {
								uni.$showMsg('获取登录凭证失败！');
								console.error(err);
							}
						});
					},
					fail: (err) => {
						uni.$showMsg('您取消了登录授权！');
						console.error(err);
					}
				});
			},

			// 修改 getUserInfo 方法
			async getUserInfo(e) {
				// 获取用户信息成功，e.userInfo 就是用户的基本信息
				console.log(e.userInfo);

				// 将用户的基本信息存储到 vuex 中
				this.updateUserInfo(e.userInfo);

				// 获取登录成功后的 Token 字符串
				await this.getToken(e);
			},
			// 调用登录接口，换取永久的 token
			async getToken(info) {
				try {
					// 检查必要的字段是否存在
					if (!info.code || !info.encryptedData || !info.iv || !info.rawData || !info.signature) {
						throw new Error('缺少必要的登录信息');
					}

					const query = {
						code: info.code,
						encryptedData: info.encryptedData,
						iv: info.iv,
						rawData: info.rawData,
						signature: info.signature
					}

					console.log('发送登录请求，参数：', query);

					const {
						data: loginResult
					} = await uni.$http.post('/api/public/v1/users/wxlogin', query);

					console.log('登录响应：', loginResult);

					if (loginResult.meta.status !== 200) {
						throw new Error(loginResult.meta.msg || '登录失败');
					}

					this.updateToken(loginResult.message.token);
					uni.$showMsg('登录成功');
				} catch (error) {
					console.error('登录错误：', error);
					uni.$showMsg(`登录失败：${error.message}`);
				}

				// 如果不为 null，则登录成功之后，需要重新导航到对应的页面
				this.navigateBack()
			},
			// 返回登录之前的页面
			navigateBack() {
				// redirectInfo 不为 null，并且导航方式为 switchTab
				if (this.redirectInfo && this.redirectInfo.openType === 'switchTab') {
					// 调用小程序提供的 uni.switchTab() API 进行页面的导航
					uni.switchTab({
						// 要导航到的页面地址
						url: this.redirectInfo.from,
						// 导航成功之后，把 vuex 中的 redirectInfo 对象重置为 null
						complete: () => {
							this.updateRedirectInfo(null)
						}
					})
				}
			}
		}
	}
</script>

<style lang="scss">
	.login-container {
		// 登录盒子的样式
		height: 750rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #f8f8f8;
		position: relative;
		overflow: hidden;

		// 绘制登录盒子底部的半椭圆造型
		&::after {
			content: ' ';
			display: block;
			position: absolute;
			width: 100%;
			height: 40px;
			left: 0;
			bottom: 0;
			background-color: white;
			border-radius: 100%;
			transform: translateY(50%);
		}

		// 登录按钮的样式
		.btn-login {
			width: 90%;
			border-radius: 100px;
			margin: 15px 0;
			background-color: #c00000;
		}

		// 按钮下方提示消息的样式
		.tips-text {
			font-size: 12px;
			color: gray;
		}
	}
</style>