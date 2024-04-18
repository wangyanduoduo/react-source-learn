/*
 * @Author: wy
 * @Date: 2024-03-27 14:09:16
 * @LastEditors: wy
 * @LastEditTime: 2024-04-18 10:36:20
 * @FilePath: /react-source-learn/demos/test-fc/main.tsx
 * @Description:
 */
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = function () {
	const [num, setNum] = useState(100);
	// window.setNum = setNum;
	// window.num = num;
	return <span onClick={() => setNum(num + 1)}>{num}</span>;
};
function Child() {
	return <span>wy-test</span>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
