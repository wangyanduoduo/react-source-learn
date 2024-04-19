/*
 * @Author: wy
 * @Date: 2024-03-27 14:09:16
 * @LastEditors: wy
 * @LastEditTime: 2024-04-19 17:54:19
 * @FilePath: /react-source-learn/demos/test-fc/main.tsx
 * @Description:
 */
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = function () {
	const [num, setNum] = useState(100);
	// window.setNum = setNum;
	// window.num = num;
	const arr =
		num % 2 === 0
			? [<li key="1">1</li>, <li key="2">2</li>, <li key="3">3</li>]
			: [<li key="3">3</li>, <li key="2">2</li>, <li key="1">1</li>];
	return <ul onClick={() => setNum(num + 1)}>{arr}</ul>;
};
function Child() {
	return <span>wy-test</span>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
