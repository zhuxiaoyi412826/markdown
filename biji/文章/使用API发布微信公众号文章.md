1 获取 AppID 和密码 设置白名单

![image-20250703225313799](C:\Users\DELL\AppData\Roaming\Typora\typora-user-images\image-20250703225313799.png)

2 npm install axios form-data 安装依赖

1. a.js

```
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const FormData = require('form-data');

class WechatPublisher {
  constructor(appId, appSecret) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.accessToken = null;
    this.tokenExpireTime = 0;
  }

  // 获取 Access Token（有效期2小时，需缓存避免频繁请求）
  async getAccessToken() {
    // 检查缓存的 token 是否有效
    if (this.accessToken && Date.now() < this.tokenExpireTime - 60000) {
      return this.accessToken;
    }

    try {
      const response = await axios.get(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`
      );

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        this.tokenExpireTime = Date.now() + response.data.expires_in * 1000;
        console.log('获取 Access Token 成功');
        return this.accessToken;
      } else {
        throw new Error(`获取 Access Token 失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('获取 Access Token 异常:', error.message);
      throw error;
    }
  }

  // 上传图文消息内的图片获取URL（用于文章中的图片）
  async uploadImage(imagePath) {
    const accessToken = await this.getAccessToken();
    const form = new FormData();
    const fileStream = require('fs').createReadStream(imagePath);
    form.append('media', fileStream, {
      filename: path.basename(imagePath),
      contentType: 'image/jpeg'
    });

    try {
      console.log(`正在上传图文内容图片，文件: ${imagePath}`);
      const response = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${accessToken}`,
        form,
        { headers: form.getHeaders() }
      );

      console.log('上传图片响应:', JSON.stringify(response.data));
      if (response.data.url) {
        console.log('图片上传成功，URL:', response.data.url);
        return response.data.url;
      } else {
        throw new Error(`图片上传失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('图片上传异常:', error.message);
      if (error.response) {
        console.error('错误响应数据:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  // 上传临时素材（图片）获取media_id
  async uploadTempMedia(imagePath, type = 'image') {
    const accessToken = await this.getAccessToken();
    const form = new FormData();
    const fileStream = require('fs').createReadStream(imagePath);
    form.append('media', fileStream, {
      filename: path.basename(imagePath),
      contentType: 'image/jpeg'
    });
    form.append('type', type);

    try {
      console.log(`正在上传临时素材，类型: ${type}, 文件: ${imagePath}`);
      const response = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${accessToken}&type=${type}`,
        form,
        { headers: form.getHeaders() }
      );

      console.log('上传临时素材响应:', JSON.stringify(response.data));
      if (response.data.media_id) {
        console.log('临时素材上传成功，media_id:', response.data.media_id);
        return response.data.media_id;
      } else {
        throw new Error(`临时素材上传失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('临时素材上传异常:', error.message);
      if (error.response) {
        console.error('错误响应数据:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  // 上传图文消息素材
  async uploadNews(articles) {
    const accessToken = await this.getAccessToken();

    try {
      console.log('准备上传图文素材，文章数据:', JSON.stringify(articles));
      const response = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/media/uploadnews?access_token=${accessToken}`,
        { articles }
      );

      console.log('上传图文素材响应:', JSON.stringify(response.data));
      if (response.data.media_id) {
        console.log('图文素材上传成功，media_id:', response.data.media_id);
        return response.data.media_id;
      } else {
        throw new Error(`图文素材上传失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('图文素材上传异常:', error.message);
      if (error.response) {
        console.error('错误响应数据:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  // 发布图文消息到所有用户
  async publishArticle(mediaId) {
    const accessToken = await this.getAccessToken();

    try {
      console.log('准备发布图文消息，media_id:', mediaId);
      
      // 使用群发接口发送给所有用户
      const response = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/message/mass/sendall?access_token=${accessToken}`,
        {
          filter: {
            is_to_all: true
          },
          mpnews: {
            media_id: mediaId
          },
          msgtype: "mpnews",
          send_ignore_reprint: 0
        }
      );

      console.log('发布图文消息响应:', JSON.stringify(response.data));
      if (response.data.errcode === 0) {
        console.log('图文消息发布成功，msg_id:', response.data.msg_id);
        return response.data.msg_id;
      } else {
        throw new Error(`图文消息发布失败: ${response.data.errmsg || JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.error('图文消息发布异常:', error.message);
      if (error.response) {
        console.error('错误响应数据:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  /**
   * 创建并发布文章
   * @param {Object} article 文章对象
   * @param {string} thumbImagePath 封面图片路径
   * @returns {Promise<string>} 发布ID
   */
  async createAndPublishArticle(article, thumbImagePath = null) {
    try {
      // 如果提供了封面图片路径，先上传获取media_id
      if (thumbImagePath) {
        console.log('正在上传封面图片...');
        const thumbMediaId = await this.uploadTempMedia(thumbImagePath, 'image');
        article.thumb_media_id = thumbMediaId;
      } else if (!article.thumb_media_id || article.thumb_media_id === 'THUMB_MEDIA_ID') {
        // 如果没有有效的thumb_media_id，使用默认图片或抛出错误
        throw new Error('缺少有效的封面图片media_id，请提供thumbImagePath参数或确保thumb_media_id有效');
      }

      console.log('正在上传图文素材...');
      const mediaId = await this.uploadNews([article]);

      console.log('正在发布图文消息...');
      const msgId = await this.publishArticle(mediaId);

      return msgId;
    } catch (error) {
      console.error('发布文章过程中出错:', error);
      throw error;
    }
  }
}

// 使用示例
(async () => {
  // 替换为你的公众号信息  这里使用的是测试号
  const appId = 'wx8b85ac15c00e6b04';
  const appSecret = '1b560c9bb8670694065aa4b990ee0f59';
  
  const publisher = new WechatPublisher(appId, appSecret);
  
  try {
    // 创建简化的文章内容（避免复杂HTML导致的问题）
    const simpleContent = `
      <p>这是一篇自动化测试文章</p>
      <p>发布时间: ${new Date().toLocaleString()}</p>
      <p>测试微信公众号文章发布功能</p>
    `;
    
    // 文章内容示例
    const article = {
      title: '自动化测试文章',
      author: '测试作者',
      digest: '这是一篇自动化测试文章',
      show_cover_pic: 1, // 是否显示封面图
      content: simpleContent,
      content_source_url: 'https://example.com/article' // 阅读原文链接
    };

    // 使用16.jpg作为封面图片
    const thumbImagePath = path.join(__dirname, '16.jpg');
    const publishId = await publisher.createAndPublishArticle(article, thumbImagePath);
    console.log(`文章发布成功！发布ID: ${publishId}`);
  } catch (error) {
    console.error('发布失败:', error);
  }
})();
```

2. 16.jpg<img src="C:\Users\DELL\AppData\Roaming\Typora\typora-user-images\image-20250704003435917.png" alt="image-20250704003435917" style="zoom:10%;" />

   

3. package.json

   ```
   {
     "name": "ceshi",
     "version": "1.0.0",
     "description": "",
     "main": "a.js",
     "scripts": {
       "test": "echo \"Error: no test specified\" && exit 1"
     },
     "keywords": [],
     "author": "",
     "license": "ISC",
     "type": "commonjs",
     "dependencies": {
       "axios": "^1.10.0",
       "form-data": "^4.0.3"
     }
   }
   
   ```

3 启动  node a.js 

```
正在上传封面图片...
获取 Access Token 成功
正在上传临时素材，类型: image, 文件: D:\1\ceshi\16.jpg
上传临时素材响应: {"type":"image","media_id":"_fuRnoyX5O_en0K92aWXFLrPI6LuIw7Ons5izdcuUVIugKjgW8NYUb4dXxhqqm73","created_at":1751560299,"item":[]}
临时素材上传成功，media_id: _fuRnoyX5O_en0K92aWXFLrPI6LuIw7Ons5izdcuUVIugKjgW8NYUb4dXxhqqm73
正在上传图文素材...
准备上传图文素材，文章数据: [{"title":"自动化测试文章","author":"测试作 
者","digest":"这是一篇自动化测试文章","show_cover_pic":1,"content":"\n  
    <p>这是一篇自动化测试文章</p>\n      <p>发布时间: 2025/7/4 00:31:35</p>\n      <p>测试微信公众号文章发布功能</p>\n    ","content_source_url":"https://example.com/article","thumb_media_id":"_fuRnoyX5O_en0K92aWXFLrPI6LuIw7Ons5izdcuUVIugKjgW8NYUb4dXxhqqm73"}]
上传图文素材响应: {"type":"news","media_id":"_fuRnoyX5O_en0K92aWXFFLA62MhH72toeRfXeQnkWYYO5VOT2kWjpxiYoW6kyMt","created_at":1751560304,"item":[]}
图文素材上传成功，media_id: _fuRnoyX5O_en0K92aWXFFLA62MhH72toeRfXeQnkWYYO5VOT2kWjpxiYoW6kyMt
正在发布图文消息...
准备发布图文消息，media_id: _fuRnoyX5O_en0K92aWXFFLA62MhH72toeRfXeQnkWYYO5VOT2kWjpxiYoW6kyMt
发布图文消息响应: {"errcode":0,"errmsg":"send job submission success","msg_id":1000000003,"msg_data_id":2247483660}
图文消息发布成功，msg_id: 1000000003
文章发布成功！发布ID: 1000000003
```

4 官方测试id

https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login 测试ID

```
wx8b85ac15c00e6b04
1b560c9bb8670694065aa4b990ee0f59
```

5 切换自己的

如果使用的是自己的微信公众号信息，可能报如下错误，没有群发接口权限

订阅号：没有群发接口权限，无法使用 message/mass/sendall 接口

 服务号：需要认证后才能使用群发接口 

企业号/小程序：接口权限不同

```
PS D:\1\ceshi> node a.js
正在上传封面图片...
获取 Access Token 成功
正在上传临时素材，类型: image, 文件: D:\1\ceshi\16.jpg
上传临时素材响应: {"type":"image","media_id":"t93nD2bjiLNTAMoVnfZDtlMk89w5eapUpxQH4toS1HHRsvU5G5myRw1dm2C00Pgb","created_at":1751558530,"item":[]}
临时素材上传成功，media_id: t93nD2bjiLNTAMoVnfZDtlMk89w5eapUpxQH4toS1HHRsvU5G5myRw1dm2C00Pgb
正在上传图文素材...
准备上传图文素材，文章数据: [{"title":"自动化测试文章","author":"测试作
者","digest":"这是一篇自动化测试文章","show_cover_pic":1,"content":"\n  
    <p>这是一篇自动化测试文章</p>\n      <p>发布时间: 2025/7/4 00:01:30</p>\n      <p>测试微信公众号文章发布功能</p>\n    ","content_source_url":"https://example.com/article","thumb_media_id":"t93nD2bjiLNTAMoVnfZDtlMk89w5eapUpxQH4toS1HHRsvU5G5myRw1dm2C00Pgb"}]
上传图文素材响应: {"errcode":48001,"errmsg":"api unauthorized rid: 6866a982-0f144857-4371517e"}
图文素材上传异常: 图文素材上传失败: api unauthorized rid: 6866a982-0f144857-4371517e
发布文章过程中出错: Error: 图文素材上传失败: api unauthorized rid: 6866a982-0f144857-4371517e
    at WechatPublisher.uploadNews (D:\1\ceshi\a.js:125:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async WechatPublisher.createAndPublishArticle (D:\1\ceshi\a.js:193:23)
    at async D:\1\ceshi\a.js:234:23
发布失败: Error: 图文素材上传失败: api unauthorized rid: 6866a982-0f144857-4371517e
    at WechatPublisher.uploadNews (D:\1\ceshi\a.js:125:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async WechatPublisher.createAndPublishArticle (D:\1\ceshi\a.js:193:23)
    at async D:\1\ceshi\a.js:234:23
PS D:\1\ceshi>

```

