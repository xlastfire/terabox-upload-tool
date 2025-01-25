// syscfg APIへのリクエスト
async function getSysCfg() {
    const url = 'https://www.terabox.com/api/getsyscfg';
    const params = {
        app_id: '250528',
        web: '1',
        channel: 'dubox',
        clienttype: '0',
        jsToken: 'BDFC7E99221F980D72CA17B19C98F23E35D1C43EBD1B76F2CE493F27A1C2E7C71D7F637156999EF9A71106D82A4836DE040DA96397B95B7F95DDE4836EA0766B',
        'dp-logid': '18397400250736220038',
        cfg_category_keys: '[{"cfg_category_key":"web_download_to_pc_exp_flow_new","cfg_version":1},{"cfg_category_key":"web_download_to_pc","cfg_version":1}]',
        version: '0',
        language_type: 'ja'
    };

    const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    return data;
}

// home info APIへのリクエスト
async function getHomeInfo() {
    const url = 'https://www.terabox.com/api/home/info';
    const params = {
        app_id: '250528',
        web: '1',
        channel: 'dubox',
        clienttype: '0',
        jsToken: 'BDFC7E99221F980D72CA17B19C98F23E35D1C43EBD1B76F2CE493F27A1C2E7C71D7F637156999EF9A71106D82A4836DE040DA96397B95B7F95DDE4836EA0766B',
        'dp-logid': '18397400250736220039'
    };

    const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    return data;
}

// ダウンロードURL取得のための関数
async function getDownloadUrl(fidlist) {
    const sysCfg = await getSysCfg();
    const homeInfo = await getHomeInfo();

    console.log('System Configuration:', sysCfg);
    console.log('Home Info:', homeInfo);

    const downloadUrl = 'https://www.terabox.com/api/download';
    
    // ダウンロードパラメータの設定
    const params = {
        app_id: '250528',
        web: '1',
        channel: 'dubox',
        clienttype: '0',
        jsToken: 'BDFC7E99221F980D72CA17B19C98F23E35D1C43EBD1B76F2CE493F27A1C2E7C71D7F637156999EF9A71106D82A4836DE040DA96397B95B7F95DDE4836EA0766B',
        'dp-logid': '18397400250736220040',
        fidlist: JSON.stringify(fidlist), // fidlistを渡す
        type: 'dlink',
        vip: '2',
        sign: 'VeJPxoh1ryXIWRvdcBXzMXJvl9iJMry0sUyKk7FrD5ohO4wghBmZ7w==',
        timestamp: '1737845700',
        need_speed: '0',
        bdstoken: 'bbc878665ecd53f583ce583d16deddd9'
    };

    // ダウンロードリクエスト送信
    const response = await fetch(`${downloadUrl}?${new URLSearchParams(params)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    // ダウンロードリンクが存在する場合、リンクを返す
    if (data.dlink && data.dlink.length > 0) {
        return data.dlink[0].dlink;
    } else {
        throw new Error('Download link not found.');
    }
}

// `dlFiles` 関数: ダウンロードリンクを返す
async function dlFiles(fidlist) {
    try {
        const downloadLink = await getDownloadUrl(fidlist);
        return downloadLink;
    } catch (error) {
        console.error('Error:', error);
        throw error; // エラーがあった場合は再度投げる
    }
}

// 使用例
(async () => {
    try {
        const fidlist = [546136331131393]; // ダウンロード対象のファイルIDリスト
        const downloadLink = await dlFiles(fidlist);
        console.log('Download Link:', downloadLink);

        // ダウンロードリンクが取得できたら、URLを返す
        return downloadLink;
    } catch (error) {
        console.error('Error:', error);
    }
})();
