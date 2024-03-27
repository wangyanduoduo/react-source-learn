/*
 * @Author: wy
 * @Date: 2024-03-27 14:09:16
 * @LastEditors: wy
 * @LastEditTime: 2024-03-27 14:40:46
 * @FilePath: /react-source-learn/react-demo/test-fc/main.tsx
 * @Description:
 */
import React from 'react';
import ReactDOM from 'react-dom/client';

const App = function () {
	return (
		<div>
			<span>world---</span>
		</div>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
