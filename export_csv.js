function exportToCSV() {
    // 创建一个 CSV 内容字符串，并在文件开头添加 BOM 标记
    let csvContent = "\uFEFF"; 
    csvContent += "时间,环境温度,目标温度,压力,smp温度\n"; // CSV 标题行

    // 遍历每个数据点并格式化为 CSV 行
    for (let i = 0; i < timeStamps.length; i++) {
        let row = [
            timeStamps[i].toLocaleTimeString(), 
            envTemps[i].toFixed(2), 
            targetTemps[i].toFixed(2),
            pressures[i].toFixed(2),
            temperatures[i].toFixed(2)
        ].join(","); // 用逗号分隔每个数据
        csvContent += row + "\n"; // 每行结束后换行
    }

    // 创建 Blob 对象以存储 CSV 数据
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "temperature_data.csv");

    // 将链接添加到文档中，触发点击后再移除
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 释放 URL 对象
    URL.revokeObjectURL(url);
}

// 为导出按钮添加事件监听器
document.getElementById('export-btn').addEventListener('click', exportToCSV);