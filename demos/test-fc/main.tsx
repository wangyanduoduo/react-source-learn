/*
 * @Author: wy
 * @Date: 2024-03-27 14:09:16
 * @LastEditors: wy
 * @LastEditTime: 2024-03-28 13:50:21
 * @FilePath: /react-source-learn/demos/test-fc/main.tsx
 * @Description:
 */
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = function () {
	const [num] = useState(100);
	return (
		<div>
			<span>{num}</span>
		</div>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
