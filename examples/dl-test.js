// トークンや共通パラメータの定義
const config = {
    appParams: {
        app_id: '250528',
        web: '1',
        channel: 'dubox',
        clienttype: '0',
        jsToken: '3F3649BB89A2A6A09BB50936F9C72BF1D8AD957C2C90DFD89F8213A3150FB8BCCDEB94CC4F3F3D863287FE9BCA60922AF06C81F36045A823C1DD16CF69961185',
        version: '0',
        language_type: 'ja'
    },
    apiUrls: {
        sysCfg: 'https://www.terabox.com/api/getsyscfg',
        homeInfo: 'https://www.terabox.com/api/home/info',
        download: 'https://www.terabox.com/api/download'
    },
    dpLogIds: {
        sysCfg: '18397400250736220038',
        homeInfo: '18397400250736220039',
        download: '18397400250736220040'
    },
    downloadParams: {
        sign: 'AbhLnIx+qyadDEqGJUP3bSdpltjQaLft5kzQnORsD8wnPtkuhkiV6A==',
        timestamp: '1738019249',
        need_speed: '0',
        vip: '2',
        bdstoken: '43bfe2c66a09d4e4561d68d6f4f10340'
    }
};

// syscfg APIへのリクエスト
async function getSysCfg() {
    const { appParams, apiUrls, dpLogIds } = config;
    const url = apiUrls.sysCfg;
    const params = {
        ...appParams,
        'dp-logid': dpLogIds.sysCfg,
        cfg_category_keys: '[{"cfg_category_key":"web_download_to_pc_exp_flow_new","cfg_version":1},{"cfg_category_key":"web_download_to_pc","cfg_version":1}]'
    };

    const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return response.json();
}

// home info APIへのリクエスト
async function getHomeInfo() {
    const { appParams, apiUrls, dpLogIds } = config;
    const url = apiUrls.homeInfo;
    const params = {
        ...appParams,
        'dp-logid': dpLogIds.homeInfo
    };

    const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return response.json();
}

// ダウンロードURL取得のための関数
async function getDownloadUrl(fidlist) {
    const { appParams, apiUrls, dpLogIds, downloadParams } = config;

    // サブAPIから情報を取得
    const sysCfg = await getSysCfg();
    const homeInfo = await getHomeInfo();

    console.log('System Configuration:', sysCfg);
    console.log('Home Info:', homeInfo);

    const url = apiUrls.download;
    const params = {
        ...appParams,
        'dp-logid': dpLogIds.download,
        fidlist: JSON.stringify(fidlist),
        type: 'dlink',
        ...downloadParams
    };

    // ダウンロードリクエスト送信
    const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

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
        throw error;
    }
}

// 使用例
(async () => {
    try {
        const fidlist = [217911186381995]; // ダウンロード対象のファイルIDリスト
        const downloadLink = await dlFiles(fidlist);
        console.log('Download Link:', downloadLink);

        return downloadLink; // 必要に応じてリンクを返す
    } catch (error) {
        console.error('Error:', error);
    }
})();
