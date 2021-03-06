import Vue from 'vue';
import Router from 'vue-router';
import Upload from '@/views/Upload.vue';
import Purchase from '@/views/Purchase.vue';
import Files from '@/views/Files.vue';

Vue.use(Router);

export default new Router({
	routes: [
		{
			path: '/',
			name: 'upload',
			component: Upload
		},
		{
			path: '/purchase/:id',
			name: 'purchase',
			component: Purchase
		},
		{
			path: '/files',
			name: 'files',
			component: Files
		}
	]
});
