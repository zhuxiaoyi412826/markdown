

# 必会知识点

1. **五大基础数据类型 + 底层结构** **手写五大数据结构和应用场景和命令**（核心重中之重）
2. **四种特殊增强类型 业务场景与使用**
3. **Redis 事务机制、乐观锁 WATCH**
4. **过期删除策略 + 六大内存淘汰策略**
5. **RDB/AOF 持久化原理与混合持久化**
6. **缓存三大问题：穿透、击穿、雪崩解决方案**
7. **分布式锁实现原理、Lua 脚本防误删**
8. **单线程模型快的原因、IO 多路复用**
9. **主从复制、哨兵、Cluster 集群架构**
10. **Pipeline 管道、Lua 脚本原子性**
11. **BigKey 热 Key 危害与优化方案**
12. **常用高频命令、生产禁用危险命令**
13. **Redis 缓存设计规范与业务实战用法**
14. **Redis 性能调优、内存配置优化**
15. **Redis 常见故障排查与线上问题处理**
16. **1 java如何操作redis书写格式  2Jedis   3Spring Data Redis**

# 什么是Redis

## 什么是NoSQL

### 1. 一句话定义

**NoSQL = 非关系型数据库**，**不遵循表格行列结构**，用来存**海量、灵活、高并发**数据。

### 2. 和 MySQL（SQL）最大区别

- **SQL（MySQL/Oracle）**：表格、行、列、固定字段、讲究**关系** 结构化数据
- **NoSQL**：无固定表结构、**灵活自由**、主打快、量大 非结构化

### 3. 四类主流 NoSQL

1. 键值型（Redis）

   存 key=value，最快，做缓存、会话

2. 文档型（MongoDB）

   存 JSON / 类 JSON，字段随便加，最常用

3. 列族型（HBase）

   超大海量数据、大数据场景

4. 图数据库（Neo4j）

   存关系：好友、社交、路径、人脉

### 4. NoSQL 优点

- 结构灵活，字段随便增减
- 读写速度极快，扛高并发
- 轻松横向扩容，存海量数据
- 不用设计复杂表关系

### 5. NoSQL 缺点

- **不支持强事务**（转账这类慎用）
- 查询语法不如 SQL 通用
- 复杂联表查询很麻烦

## 什么是Redis

### 1. 一句话

Redis诞生于2009年全称是Remote Dictionary Server，远程词典服务器

**Redis 是最快的 NoSQL 键值内存数据库，主打高速缓存**

**面试常问：日常使用 5 种 数据类型**

**底层源码：8 种底层数据结构**

**完整版可使用：9 种**（5 基础 + 4 扩展）

[指令 |文档](https://redis.io/docs/latest/commands/) 官网

### 2. 核心特点

- **数据存在内存**，读写**超级快**
- 断电怕丢数据，支持**持久化存硬盘**
- 纯键值 `key:value` 结构
- 单线程模型，并发极强

### 3. 五大常用数据类型

1. **String** 字符串（存文字、数字、手机号）
2. **Hash** 哈希（存用户信息、商品）
3. **List** 列表（消息队列、排队）
4. **Set** 集合（去重、好友列表）
5. **ZSet** 有序集合（排行榜、积分排名）

### 4. 日常用途（面试必背）

1. **接口缓存**：查数据库慢，先查 Redis
2. **登录令牌 Token 存储**
3. **验证码、短信倒计时**
4. **分布式锁**（多服务抢资源）
5. **点赞、浏览量、排行榜**
6. **限流、防重复提交**
7. **消息队列简易实现**

### 5. 优缺点

**优点**

- 速度天花板
- 用法简单
- 高并发友好
- 功能极多

**缺点**

- 内存成本高，不能存超大冷数据
- 内存满会淘汰数据
- 不适合存复杂事务

### 6. 最简单对比

- **MySQL**：存正式业务数据，稳、持久
- **Redis**：存热点高频数据，快、提速

## 安装

redis-server 前台启动   start /b 临时后台启动

INFO server 查看redis版本  cmd 下查看redis版本 redis-server --version

redis版本下载  

[Releases · redis-windows/redis-windows](https://github.com/redis-windows/redis-windows/releases)

![image-20260519075159882](C:\Users\DELL\Desktop\笔记\数据库\img\Reids\下载.png)

选择这个 **Redis-8.4.1-Windows-x64-msys2-with-Service.zip**

# Redis 命令

## 数据结构

Redis是一个key-value的数据库，key一般是String类型，不过value的类型多种多样：

| 数据类型 | 全称     | 存储结构           | 有序性       | 能否重复     | 核心特点                         | 常用命令                         | 适用业务场景                                      |
| -------- | -------- | ------------------ | ------------ | ------------ | -------------------------------- | -------------------------------- | ------------------------------------------------- |
| String   | 字符串   | 简单动态字符串     | 无顺序       | 互不影响     | 最简单、可存文本 / 数字 / JSON   | set、get、incr、append           | 缓存数据、验证码、Token、计数器、手机号、普通配置 |
| List     | 列表     | QuickList 快速链表 | **有序**     | **允许重复** | 头尾操作极快，中间查询慢         | lpush、rpush、lpop、rpop、lrange | 消息队列、浏览记录、朋友圈时间线、排队队列        |
| Hash     | 哈希     | 压缩列表 + 字典    | 无序         | field 唯一   | 适合存对象，节省内存             | hset、hget、hgetall、hincrby     | 用户信息、商品信息、购物车、员工资料              |
| Set      | 无序集合 | 哈希表             | **无序**     | **自动去重** | 天然去重，支持交集 / 差集 / 并集 | sadd、smembers、sinter、sdiff    | 好友列表、共同好友、点赞统计、抽奖去重            |
| ZSet     | 有序集合 | 跳表 + 哈希表      | **有序排序** | 成员唯一     | 带分数排序，可升降序             | zadd、zrange、zrevrank、zscore   | 排行榜、成绩排名、积分排行、延时队列              |

**存单个值 → String**

**存对象字段 → Hash**

**做队列顺序数据 → List**

**需要自动去重 → Set**

**需要排序排名 → ZSet**

Redis6 + 还支持：

1. **Geospatial** 地理位置（经纬度、附近人）
2. **Bitmap** 位图（签到、状态标记）
3. **HyperLogLog** 基数统计（海量去重统计）
4. **Stream** 消息流（可靠消息队列）

## Redis 通用命令

（所有数据类型都能用）

1. **keys \*** 查看所有 key
2. **exists key** 判断 key 是否存在
3. **del key** 删除 key
4. **expire key 秒数** 设置过期时间
5. **ttl key** 查看剩余过期时间
6. **persist key** 取消过期
7. **type key** 查看 key 是什么类型
8. **rename 旧 key 新 key** 重命名 key
9. **randomkey** 随机获取一个 key
10. **move key 库号** 移动 key 到其他数据库
11. **select 0** 切换数据库（0-15）
12. **flushdb** 清空当前数据库
13. **flushall** 清空全部数据库

COMMAND INFO keys  查看某个命令怎么使用 

help keys cmd Linux下使用



## String

String类型

**String类型，也就是字符串类型，是Redis中最简单的存储类型。其value是字符串，不过根据字符串的格式不同，又可以分为3类：**
**string：普通字符串**
**int：整数类型，可以做自增、自减操作**
**float：浮点类型，可以做自增、自减操作**
**不管是哪种格式，底层都是字节数组形式存储，只不过是编码方式不同。字符串类型的最大空间不能超过512m.**

String的常见命令有：

```
SET：添加或者修改已经存在的一个String类型的键值对
GET：根据key获取String类型的value
MSET：批量添加多个String类型的键值对
MGET：根据多个key获取多个String类型的value
INCR：让一个整型的key自增1
INCRBY:让一个整型的key自增并指定步长，例如：incrby num 2 让num值自增2
INCRBYFLOAT：让一个浮点类型的数字自增并指定步长
SETNX：添加一个String类型的键值对，前提是这个key不存在，否则不执行
SETEX：添加一个String类型的键值对，并且指定有效期
```

```
# 1. 设置值
set k1 hello

# 2. 获取值
get k1

# 3. 不存在才设置（防覆盖）
setnx k1 123

# 4. 设置+指定过期时间(秒)
setex k2 10 666

# 5. 批量设置
mset name zhang age 20 sex nan

# 6. 批量获取
mget name age sex

# 7. 数值自增1
incr num

# 8. 数值自减1
decr num

# 9. 增减指定步数
incrby num 5
decrby num 3

# 10. 末尾追加内容
append k1 world

# 11. 获取字符串长度
strlen k1

# 12. 获取部分字符
getrange k1 0 3

# 13. 覆盖指定位置
setrange k1 2 abc
```



Redis的key允许有多个单词形成层级结构，多个单词之间用':'隔开，格式如下：

如果Value是一个Java对象，例如一个User对象，则可以将对象序列化为JSON字符串后存储：

```
setex student:1 3600 '{"id":1,"name":"小明","age":19,"gender":"男","address":"河南驻马店"}'
```

```
get student:1
```

## Hash

**1.hash类型**

**Hash类型，也叫散列，其value是一个无序字典，类似于Java中的HashMap结构。**
**String结构是将对象序列化为JSON字符串后存储，当需要修改对象某个字段时很不方便：**
**Hash结构可以将对象中的每个字段独立存储，可以针对单个字段做CRUD：**

**ash = Redis 里的「对象」**

专门用来存 **一个 key 对应多个字段** 的数据。

比如：

- 学生：id、姓名、年龄、性别
- 用户：id、昵称、手机号、头像
- 商品：id、名称、价格、库存

**一个 key 存一整个对象！**

```
key  →  { 字段1:值1, 字段2:值2, 字段3:值3 ... }
```

```
student:1  →  { id:1, name:"小明", age:19, gender:"男" }
```

**2.和 String 存 JSON 的区别**

- **String JSON**：整个对象一整块存，**要改必须全改**
- **Hash**：可以**单独改名字、单独改年龄**，不用动其他字段

**实际开发：存对象优先用 Hash！**

 **3.为什么要用 Hash？（重点）**

1. **结构清晰**，像对象一样
2. **单独修改字段**，不用全量更新
3. **节省内存**，比存 JSON 更高效
4. **最适合存：用户、商品、学生、订单**

**4.常用命令**

```
HSET key field value：添加或者修改hash类型key的field的值
HGET key field：获取一个hash类型key的field的值
HMSET：批量添加多个hash类型key的field的值
HMGET：批量获取多个hash类型key的field的值
HGETALL：获取一个hash类型的key中的所有的field和value
HKEYS：获取一个hash类型的key中的所有的field
HVALS：获取一个hash类型的key中的所有的value
HINCRBY:让一个hash类型key的字段值自增并指定步长
HSETNX：添加一个hash类型的key的field值，前提是这个field不存在，否则不执行
```

```
练习 1：存入学生信息
redis
hset stu:01 sid 1 name 李明 age 18 class 一班 score 88
练习 2：单独查姓名
redis
hget stu:01 name
练习 3：查姓名 + 年龄 + 分数
redis
hmget stu:01 name age score
练习 4：查看学生全部信息
redis
hgetall stu:01
练习 5：修改年龄
redis
hset stu:01 age 19
练习 6：分数加 5
redis
hincrby stu:01 score 5
练习 7：删除班级字段
redis
hdel stu:01 class
练习 8：统计有几个属性
redis
hlen stu:01
练习 9：清空当前库
redis
flushdb
```

## List

Redis中的List类型与Java中的LinkedList类似，可以看做是一个双向链表结构。既可以支持正向检索和也可以支持反向检索。
特征也与LinkedList类似：
有序
元素可以重复
插入和删除快
查询速度一般
常用来存储一个有序数据，例如：朋友圈点赞列表，评论列表等。

```
List的常见命令有：
LPUSH key  element ... ：向列表左侧插入一个或多个元素
LPOP key：移除并返回列表左侧的第一个元素，没有则返回nil
RPUSH key  element ... ：向列表右侧插入一个或多个元素
RPOP key：移除并返回列表右侧的第一个元素
LRANGE key star end：返回一段角标范围内的所有元素
BLPOP和BRPOP：与LPOP和RPOP类似，只不过在没有元素时等待指定时间，而不是直接返回nil
```

```
练习 1：从左侧插入班级学生
redis
lpush class:stu 小明 小红 小刚
练习 2：从右侧插入两名学生
redis
rpush class:stu 小丽 小强
练习 3：查看列表所有学生（全部数据）
redis
lrange class:stu 0 -1
练习 4：查看列表长度
redis
llen class:stu
练习 5：移除左侧第一个学生
redis
lpop class:stu
练习 6：移除右侧最后一个学生
redis
rpop class:stu
练习 7：修改索引为 1 位置的学生名字
redis
lset class:stu 1 小宇
练习 8：根据值删除指定数量相同元素
redis
lrem class:stu 1 小红
练习 9：截取保留前 3 个学生，其余删除
redis
ltrim class:stu 0 2
练习 10：获取指定索引位置学生
redis
lindex class:stu 0
清空当前数据库
redis
flushdb
```

## set

Redis的Set结构与Java中的HashSet类似，可以看做是一个value为null的HashMap。因为也是一个hash表，因此具备与HashSet类似的特征：
无序
元素不可重复
查找快
支持交集、并集、差集等功能

set的常见命令有：

```
SADD key member ... ：向set中添加一个或多个元素
SREM key member ... : 移除set中的指定元素
SCARD key： 返回set中元素的个数
SISMEMBER key member：判断一个元素是否存在于set中
SMEMBERS：获取set中的所有元素
SINTER key1 key2 ... ：求key1与key2的交集
SDIFF key1 key2 ... ：求key1与key2的差集
SUNION key1 key2 ..：求key1和key2的并集
```

```
练习 1：存入好友数据
redis
sadd zs:friend 李四 王五 赵六
sadd ls:friend 王五 麻子 二狗
练习 2：统计张三好友人数
redis
scard zs:friend
练习 3：查询两人共同好友
redis
sinter zs:friend ls:friend
练习 4：查询张三独有好友
redis
sdiff zs:friend ls:friend
练习 5：查询两人所有好友合集
redis
sunion zs:friend ls:friend
练习 6：判断李四是否是张三好友
redis
sismember zs:friend 李四
练习 7：判断张三是否是李四好友
redis
sismember ls:friend 张三
练习 8：移除张三好友里的李四
redis
srem zs:friend 李四
练习 9：查看张三全部好友
redis
smembers zs:friend
```

## SortedSet

Redis的SortedSet是一个可排序的set集合，与Java中的TreeSet有些类似，但底层数据结构却差别很大。SortedSet中的每一个元素都带有一个score属性，可以基于score属性对元素排序，底层的实现是一个跳表（SkipList）加 hash表。
SortedSet具备下列特性：
可排序
元素不重复
查询速度快
因为SortedSet的可排序特性，经常被用来实现排行榜这样的功能。

```
SortedSet的常见命令有：
ZADD key score member：添加一个或多个元素到sortedset ，如果已经存在则更新其score值
ZREM key member：删除sorted set中的一个指定元素
ZSCORE key member : 获取sorted set中的指定元素的score值
ZRANK key member：获取sorted set 中的指定元素的排名
ZCARD key：获取sorted set中的元素个数
ZCOUNT key min max：统计score值在给定范围内的所有元素的个数
ZINCRBY key increment member：让sorted set中的指定元素自增，步长为指定的increment值
ZRANGE key min max：按照score排序后，获取指定排名范围内的元素
ZRANGEBYSCORE key min max：按照score排序后，获取指定score范围内的元素
ZDIFF、ZINTER、ZUNION：求差集、交集、并集
注意：所有的排名默认都是升序，如果要降序则在命令的Z后面添加REV即可

```

```
练习 1：存入学生成绩数据
redis
zadd class:score 85 Jack 89 Lucy 82 Rose 95 Tom 78 Jerry 92 Amy 76 Miles
练习 2：删除 Tom 同学
redis
zrem class:score Tom
练习 3：获取 Amy 同学的分数
redis
zscore class:score Amy
练习 4：获取 Rose 同学的排名（从低到高，从 0 开始）
redis
zrank class:score Rose
练习 4 扩展：获取 Rose 同学排名（从高到低，热门榜）
redis
zrevrank class:score Rose
练习 5：查询 80 分以下有几个学生
redis
zcount class:score 0 79
练习 6：给 Amy 同学加 2 分
redis
zincrby class:score 2 Amy
练习 7：查出成绩前 3 名的同学（从高到低）
redis
zrevrange class:score 0 2
练习 8：查出成绩 80 分以下的所有同学
redis
zrangebyscore class:score 0 79
练习 9：查看所有同学成绩（从低到高）
redis
zrange class:score 0 -1 withscores
练习 10：清空当前库
redis
flushdb
```

# java操作Redis

https://redis.io/clients

以Redis命令作为方法名称，学习成本低，简单实用。但是Jedis实例是线程不安全的，多线程环境下需要基于连接池来使用

Lettuce是基于Netty实现的，支持同步、异步和响应式编程方式，并且是线程安全的。支持Redis的哨兵模式、集群模式和管道模式。

Redisson是一个基于Redis实现的分布式、可伸缩的Java数据结构集合。包含了诸如Map、Queue、Lock、 Semaphore、AtomicLong等强大功能



## 1.jedis

1. https://github.com/redis/jedis

Jedis使用的基本步骤：

**1.引入依赖**

```
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>7.1.0</version>
</dependency>
```

**2.确保 Redis 服务正常运行**

redis-server

- Redis 已启动
- 端口默认：**6379**
- 若有密码，需要认证
- 防火墙 / 安全组开放 6379 端口（远程连接时）



**3.创建 Jedis 对象**

```
// 1. 创建 Jedis 连接（参数：host, port）
Jedis jedis = new Jedis("localhost", 6379);
```

**4.如果 Redis 设置了密码，进行认证**

```
// 2. 密码认证（没有密码可省略）
jedis.auth("your-redis-password");
```

5.**测试连接是否成功**

```
// 3. 测试连通性（执行 PING 命令，返回 PONG 表示成功）
System.out.println("连接成功：" + jedis.ping());
```

**6.执行 Redis 操作（字符串、哈希、列表等）**

```
// 字符串操作
jedis.set("name", "JedisTest");
System.out.println("获取name：" + jedis.get("name"));

// 哈希操作
jedis.hset("user:1", "name", "张三");
jedis.hset("user:1", "age", "20");
System.out.println("用户信息：" + jedis.hgetAll("user:1"));
```

**7.使用完毕关闭连接**

```
// 5. 关闭连接（重要！避免连接泄漏）
jedis.close();
```

**8.代码案例**

```
import redis.clients.jedis.Jedis;
public class JedisDemo {
    public static void main(String[] args) {
        // 1. 创建连接
        Jedis jedis = new Jedis("127.0.0.1", 6379);
        // 2. 密码认证（没有则注释）
        // jedis.auth("123456");
        
        // 3. 测试连接
        System.out.println("连接状态：" + jedis.ping());

        // 4. 执行操作
        jedis.set("key1", "hello redis");
        System.out.println("key1 = " + jedis.get("key1"));

        // 5. 关闭连接
        jedis.close();
    }
}
```

在使用javase是编译时要把导入的jar包也进行编译

**9.使用连接池**

```
import redis.clients.jedis.Jedis; //  Redis操作的核心类，用于执行Redis命令
import redis.clients.jedis.JedisPool; //  连接池类，用于管理Redis连接
import redis.clients.jedis.JedisPoolConfig; //  连接池配置类，用于配置连接池参数

// 连接池工具类，用于创建连接池，获取连接，释放连接等操作

class JedisPoolUtil {
    private static JedisPool jedisPool;

    static {    
        JedisPoolConfig config = new JedisPoolConfig(); //  连接池配置对象
        config.setMaxTotal(30); //  设置连接池中最大连接数
        config.setMaxIdle(10); //  设置连接池中最大空闲连接数
        config.setMinIdle(5); //  设置连接池中最小空闲连接数
        config.setTestOnBorrow(true); //  设置是否在借连接时测试连接是否有效

        jedisPool = new JedisPool(
            config,
            "localhost",
            6379,
            5000,
            null //  Redis 密码（无则填 null）
        );
    }

    public static Jedis getJedis() {    
        return jedisPool.getResource(); //  从Jedis连接池中获取一个Jedis资源
    }

    public static void close(Jedis jedis) {
        if (jedis != null) {
            jedis.close();
        }
    }
}

public class JedisPoolDemo {
    public static void main(String[] args) {
        Jedis jedis = JedisPoolUtil.getJedis();
        try {
            jedis.set("poolKey", "poolTest"); //  设置一个键值对
            System.out.println("poolKey = " + jedis.get("poolKey"));
        } finally {
            JedisPoolUtil.close(jedis); //  在finally块中确保Jedis实例被正确关闭，归还给连接池
        }
    }
}
```

## **2.SpringBoot来整合下Jedis的连接池**

**1.目录结构**

```
src
└── main
    ├── java
    │   └── com
    │       └── demo
    │           ├── JedisApplication.java  // 启动类
    │           ├── config
    │           │   └── JedisConfig.java   // Jedis连接池配置类
    │           ├── properties
    │           │   └── RedisProperties.java // Redis配置属性类
    │           └── util
    │               └── JedisUtil.java      // Jedis工具类
    └── resources
        └── application.yml  // 配置文件
```

**2.引入 jedis 依赖**

```
  <!--springboot父工程-->
   <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.5</version>
        <relativePath/>
    </parent>
    
      <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
            <exclusions> <!--       依赖排除配置，用于移除默认的 Lettuce 连接池实现      Lettuce 是一个高性能的 Redis 客户端，支持同步、异步和响应式模式    -->
                <exclusion> <!-- 排除 Lettuce 核心依赖 -->
                    <groupId>io.lettuce</groupId>
                    <artifactId>lettuce-core</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
  <!-- redis依赖-->
  <dependency>
            <groupId>redis.clients</groupId>
            <artifactId>jedis</artifactId>
            <version>7.4.0</version>
        </dependency>
        
```

2 **application.yml 配置**（连接池参数）

```
spring:
  application:
    name: redis
  data:
    redis:
      host: localhost
      port: 6379
      password: ~
      timeout: 5000
      jedis:
        pool:
          max-active: 30
          max-idle: 10
          min-idle: 5
          max-wait: 2000
```

 **3 Jedis 配置类并注入bean**（创建连接池）

```
package com.example.redis.config;

import com.example.redis.properties.RedisProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

@Configuration
public class JedisConfig {
//  定义一个不可变的 RedisProperties 类型对象 redisProperties，用于在 JedisConfig 类中存储和引用 Redis 的配置信息。
    private final RedisProperties redisProperties;

    public JedisConfig(RedisProperties redisProperties) {
        this.redisProperties = redisProperties;
    }

    @Bean    //  定义一个Bean，用于创建JedisPool连接池实例
    public JedisPool jedisPool() {
        JedisPoolConfig poolConfig = new JedisPoolConfig();
        poolConfig.setMaxTotal(redisProperties.getPool().getMaxActive()); //  设置连接池最大连接数
        poolConfig.setMaxIdle(redisProperties.getPool().getMaxIdle()); //  配置连接池的最大空闲连接数
        poolConfig.setMinIdle(redisProperties.getPool().getMinIdle()); //  配置连接池的最小空闲连接数
        poolConfig.setMaxWaitMillis(redisProperties.getPool().getMaxWait()); //  配置获取连接时的最大等待时间（毫秒）
        poolConfig.setTestOnBorrow(redisProperties.getPool().getTestOnBorrow()); //  配置在获取连接时是否进行有效性检查

        String password = redisProperties.getPassword(); //  获取Redis密码
        if (password != null && password.isEmpty()) { //  如果密码为空，设置为null
            password = null;
        }

        return new JedisPool( //  创建并返回JedisPool连接池实例
                poolConfig,
                redisProperties.getHost(),
                redisProperties.getPort(),
                redisProperties.getTimeout(),
                password
        );
    }
}
```

**4 编写配置属性类绑定 yml 配置**

```
package com.example.redis.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component  //  标记为组件，用于自动注入到其他类中
@ConfigurationProperties(prefix = "spring.data.redis")
// 类中的 默认值 是作为**后备值（Fallback）**使用的：
// 1. 优先读取配置文件 ：Spring Boot 会先从 application.yml 读取属性值
// 2. 如果配置文件中没有配置 ：才使用代码中声明的默认值
public class RedisProperties {
    private String host = "localhost";
    private Integer port = 6379; /**     * Redis服务器端口号     * 默认值为6379     */
    private String password;
    private Integer timeout = 5000;
    private Pool pool = new Pool();

    public static class Pool{ /**     * 连接池配置类     */
        private Integer maxActive = 30;
        private Integer maxIdle = 10;
        private Integer minIdle = 5;
        private Long maxWait = 2000L;
        private Boolean testOnBorrow = true;

        public Integer getMaxActive() {
            return maxActive;
        }
        public void setMaxActive(Integer maxActive) {
            this.maxActive = maxActive;
        }
        public Integer getMaxIdle() {
            return maxIdle;
        }
        public void setMaxIdle(Integer maxIdle) {
            this.maxIdle = maxIdle;
        }
        public Integer getMinIdle() {
            return minIdle;
        }
        public void setMinIdle(Integer minIdle) {
            this.minIdle = minIdle;
        }
        public Long getMaxWait() {
            return maxWait;
        }
        public void setMaxWait(Long maxWait) {
            this.maxWait = maxWait;
        }
        public Boolean getTestOnBorrow() {
            return testOnBorrow;
        }
        public void setTestOnBorrow(Boolean testOnBorrow) {
            this.testOnBorrow = testOnBorrow;
        }
    }

    public String getHost() {
        return host;
    }
    public void setHost(String host) {
        this.host = host;
    }
    public Integer getPort() {
        return port;
    }
    public void setPort(Integer port) {
        this.port = port;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public Integer getTimeout() {
        return timeout;
    }
    public void setTimeout(Integer timeout) {
        this.timeout = timeout;
    }
    public Pool getPool() {
        return pool;
    }
    public void setPool(Pool pool) {
        this.pool = pool;
    }
}
```

 **5 工具类 / Service** 拿连接

```
package com.example.redis.util;

import org.springframework.stereotype.Component;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

@Component  //  标记为组件，用于自动注入到其他类中
public class JedisUtil {

    private final JedisPool jedisPool; //  声明一个私有的final类型的JedisPool对象，用于管理Redis连接池

    public JedisUtil(JedisPool jedisPool) {
        this.jedisPool = jedisPool;
    }

    public Jedis getJedis() {
        return jedisPool.getResource();
    }

    public void close(Jedis jedis) {
        if (jedis != null) {
            jedis.close();
        }
    }
}
```

 **6 测试接口** 验证

```
package com.example.redis;

import com.example.redis.util.JedisUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import redis.clients.jedis.Jedis;

@SpringBootTest
public class RedisTest {

    @Autowired
    private JedisUtil jedisUtil;

    @Test
    void testRedis() {
        Jedis jedis = jedisUtil.getJedis();
        System.out.println("连接状态：" + jedis.ping());

        jedis.set("name", "springboot-jedis");
        System.out.println("name = " + jedis.get("name"));

        jedisUtil.close(jedis);
    }
}
```

**7 综合案例**

所有 Redis 命令，这里都有对应的 Java 方法，直接调用，不用管连接、关闭、连接池！

**完整版 Redis 五大常用数据类型工具类**，**复制即用，零修改**。

**String（字符串）、Hash（哈希）、List（列表）、Set（集合）、ZSet（有序集合）**

全部写好 **增、删、改、查** 方法，

```
import org.springframework.stereotype.Component;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.params.ScanParams;
import redis.clients.jedis.resps.ScanResult;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class JedisUtil {

    @Resource
    private JedisPool jedisPool;

    /**
     * 获取 Jedis 连接
     */
    public Jedis getJedis() {
        return jedisPool.getResource();
    }

    /**
     * 归还连接
     */
    public void close(Jedis jedis) {
        if (jedis != null) {
            jedis.close();
        }
    }

    // ================================ String ====================================

    /**
     * 设置字符串
     */
    public void set(String key, String value) {
        Jedis jedis = getJedis();
        jedis.set(key, value);
        close(jedis);
    }

    /**
     * 设置带过期时间（秒）
     */
    public void setex(String key, int seconds, String value) {
        Jedis jedis = getJedis();
        jedis.setex(key, seconds, value);
        close(jedis);
    }

    /**
     * 获取字符串
     */
    public String get(String key) {
        Jedis jedis = getJedis();
        String val = jedis.get(key);
        close(jedis);
        return val;
    }

    /**
     * 删除key
     */
    public void del(String key) {
        Jedis jedis = getJedis();
        jedis.del(key);
        close(jedis);
    }

    /**
     * 判断key是否存在
     */
    public boolean exists(String key) {
        Jedis jedis = getJedis();
        boolean res = jedis.exists(key);
        close(jedis);
        return res;
    }

    // ================================ Hash ====================================

    /**
     * hash 设置一个字段
     */
    public void hset(String key, String field, String value) {
        Jedis jedis = getJedis();
        jedis.hset(key, field, value);
        close(jedis);
    }

    /**
     * hash 批量设置
     */
    public void hmset(String key, Map<String, String> map) {
        Jedis jedis = getJedis();
        jedis.hmset(key, map);
        close(jedis);
    }

    /**
     * hash 获取一个字段
     */
    public String hget(String key, String field) {
        Jedis jedis = getJedis();
        String val = jedis.hget(key, field);
        close(jedis);
        return val;
    }

    /**
     * hash 获取所有字段
     */
    public Map<String, String> hgetAll(String key) {
        Jedis jedis = getJedis();
        Map<String, String> map = jedis.hgetAll(key);
        close(jedis);
        return map;
    }

    /**
     * hash 删除字段
     */
    public void hdel(String key, String... fields) {
        Jedis jedis = getJedis();
        jedis.hdel(key, fields);
        close(jedis);
    }

    // ================================ List ====================================

    /**
     * list 左插
     */
    public void lpush(String key, String... values) {
        Jedis jedis = getJedis();
        jedis.lpush(key, values);
        close(jedis);
    }

    /**
     * list 右插
     */
    public void rpush(String key, String... values) {
        Jedis jedis = getJedis();
        jedis.rpush(key, values);
        close(jedis);
    }

    /**
     * list 获取范围
     */
    public List<String> lrange(String key, int start, int end) {
        Jedis jedis = getJedis();
        List<String> list = jedis.lrange(key, start, end);
        close(jedis);
        return list;
    }

    /**
     * list 左出队
     */
    public String lpop(String key) {
        Jedis jedis = getJedis();
        String val = jedis.lpop(key);
        close(jedis);
        return val;
    }

    /**
     * list 右出队
     */
    public String rpop(String key) {
        Jedis jedis = getJedis();
        String val = jedis.rpop(key);
        close(jedis);
        return val;
    }

    /**
     * list 获取长度
     */
    public long llen(String key) {
        Jedis jedis = getJedis();
        long len = jedis.llen(key);
        close(jedis);
        return len;
    }

    // ================================ Set ====================================

    /**
     * set 添加
     */
    public void sadd(String key, String... values) {
        Jedis jedis = getJedis();
        jedis.sadd(key, values);
        close(jedis);
    }

    /**
     * set 获取所有
     */
    public Set<String> smembers(String key) {
        Jedis jedis = getJedis();
        Set<String> set = jedis.smembers(key);
        close(jedis);
        return set;
    }

    /**
     * set 删除元素
     */
    public void srem(String key, String... values) {
        Jedis jedis = getJedis();
        jedis.srem(key, values);
        close(jedis);
    }

    /**
     * set 判断是否存在
     */
    public boolean sismember(String key, String value) {
        Jedis jedis = getJedis();
        boolean b = jedis.sismember(key, value);
        close(jedis);
        return b;
    }

    // ================================ ZSet ====================================

    /**
     * zset 添加（带分数）
     */
    public void zadd(String key, double score, String member) {
        Jedis jedis = getJedis();
        jedis.zadd(key, score, member);
        close(jedis);
    }

    /**
     * zset 获取范围（正序）
     */
    public Set<String> zrange(String key, int start, int end) {
        Jedis jedis = getJedis();
        Set<String> set = jedis.zrange(key, start, end);
        close(jedis);
        return set;
    }

    /**
     * zset 获取范围（倒序）
     */
    public Set<String> zrevrange(String key, int start, int end) {
        Jedis jedis = getJedis();
        Set<String> set = jedis.zrevrange(key, start, end);
        close(jedis);
        return set;
    }

    /**
     * zset 删除元素
     */
    public void zrem(String key, String... members) {
        Jedis jedis = getJedis();
        jedis.zrem(key, members);
        close(jedis);
    }

    /**
     * zset 获取元素分数
     */
    public Double zscore(String key, String member) {
        Jedis jedis = getJedis();
        Double score = jedis.zscore(key, member);
        close(jedis);
        return score;
    }
}
```

**8. 综合工具类**

自动序列化、统一过期时间、注解缓存、分页缓存、防空缓存、批量操作

```
SpringBoot+Jedis 通用高级 Redis 缓存工具
实现：自动序列化、统一过期时间、注解缓存、分页缓存、防空缓存、批量操作
基于上面已有的JedisUtil改造升级，无缝接入现有项目
一、新增 JSON 序列化依赖
xml
<!-- JSON序列化 -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson2</artifactId>
    <version>2.0.51</version>
</dependency>
二、升级版 RedisCacheUtil（替换原有 JedisUtil）
java
运行
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.TypeReference;
import org.springframework.stereotype.Component;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class RedisCacheUtil {

    @Resource
    private JedisPool jedisPool;

    private static final long DEFAULT_EXPIRE = 3600L; // 默认过期1小时

    public Jedis getJedis() {
        return jedisPool.getResource();
    }

    public void close(Jedis jedis) {
        if (jedis != null) jedis.close();
    }

    // ====================== 通用基础操作 ======================
    public Boolean hasKey(String key) {
        Jedis jedis = getJedis();
        boolean exist = jedis.exists(key);
        close(jedis);
        return exist;
    }

    public void deleteKey(String key) {
        Jedis jedis = getJedis();
        jedis.del(key);
        close(jedis);
    }

    public void setExpire(String key, long seconds) {
        Jedis jedis = getJedis();
        jedis.expire(key, (int) seconds);
        close(jedis);
    }

    // ====================== String 序列化缓存(核心) ======================
    /**
     * 存入对象，默认1小时过期
     */
    public <T> void setCacheObj(String key, T obj) {
        setCacheObj(key, obj, DEFAULT_EXPIRE);
    }

    /**
     * 存入对象，自定义过期时间
     */
    public <T> void setCacheObj(String key, T obj, long expireSecond) {
        if (obj == null) return;
        String json = JSON.toJSONString(obj);
        Jedis jedis = getJedis();
        jedis.setex(key, (int) expireSecond, json);
        close(jedis);
    }

    /**
     * 获取缓存对象
     */
    public <T> T getCacheObj(String key, Class<T> clazz) {
        Jedis jedis = getJedis();
        String json = jedis.get(key);
        close(jedis);
        if (json == null || json.isEmpty()) return null;
        return JSON.parseObject(json, clazz);
    }

    /**
     * 获取List集合缓存
     */
    public <T> List<T> getCacheList(String key, TypeReference<List<T>> type) {
        Jedis jedis = getJedis();
        String json = jedis.get(key);
        close(jedis);
        if (json == null) return null;
        return JSON.parseObject(json, type);
    }

    // ====================== Hash 缓存 ======================
    public void hashSet(String key, String field, String value) {
        Jedis jedis = getJedis();
        jedis.hset(key, field, value);
        close(jedis);
    }

    public String hashGet(String key, String field) {
        Jedis jedis = getJedis();
        String val = jedis.hget(key, field);
        close(jedis);
        return val;
    }

    public Map<String, String> hashGetAll(String key) {
        Jedis jedis = getJedis();
        Map<String, String> map = jedis.hgetAll(key);
        close(jedis);
        return map;
    }

    // ====================== List 队列缓存 ======================
    public void listPush(String key, String... values) {
        Jedis jedis = getJedis();
        jedis.rpush(key, values);
        close(jedis);
    }

    public List<String> listRange(String key, int start, int end) {
        Jedis jedis = getJedis();
        List<String> list = jedis.lrange(key, start, end);
        close(jedis);
        return list;
    }

    // ====================== Set / ZSet 常用 ======================
    public void setAdd(String key, String... vals) {
        Jedis jedis = getJedis();
        jedis.sadd(key, vals);
        close(jedis);
    }

    public Set<String> setMembers(String key) {
        Jedis jedis = getJedis();
        Set<String> set = jedis.smembers(key);
        close(jedis);
        return set;
    }

    public void zSetAdd(String key, double score, String val) {
        Jedis jedis = getJedis();
        jedis.zadd(key, score, val);
        close(jedis);
    }
}
三、自定义缓存注解（实现注解式缓存）
1. 新建注解 CacheData.java
java
运行
import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CacheData {
    // 缓存key前缀
    String keyPrefix() default "";
    // 过期时间 秒
    long expireTime() default 3600;
}
2. 缓存切面 AOP CacheAspect.java
java
运行
import com.alibaba.fastjson2.JSON;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;

@Aspect
@Component
public class CacheAspect {

    @Resource
    private RedisCacheUtil redisCacheUtil;

    @Around("@annotation(cacheData)")
    public Object around(ProceedingJoinPoint joinPoint, CacheData cacheData) throws Throwable {
        // 拼接缓存key
        String key = getCacheKey(joinPoint, cacheData);
        // 先查缓存
        String cacheJson = redisCacheUtil.getJedis().get(key);
        if (StringUtils.hasText(cacheJson)) {
            redisCacheUtil.close(redisCacheUtil.getJedis());
            return JSON.parseObject(cacheJson, Object.class);
        }
        // 缓存没有，执行原方法
        Object result = joinPoint.proceed();
        // 存入缓存
        if (result != null) {
            redisCacheUtil.setCacheObj(key, result, cacheData.expireTime());
        }
        return result;
    }

    // 简易生成key：前缀+方法名
    private String getCacheKey(ProceedingJoinPoint point, CacheData cacheData) {
        String prefix = cacheData.keyPrefix();
        String methodName = point.getSignature().getName();
        return prefix + ":" + methodName;
    }
}
四、实体类测试 User.java
java
运行
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Long id;
    private String username;
    private Integer age;
}
五、业务层使用注解缓存 + 手动缓存
java
运行
import org.springframework.stereotype.Service;
import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    @Resource
    private RedisCacheUtil redisCacheUtil;

    // ========== 1. 注解式缓存（最简单） ==========
    @CacheData(keyPrefix = "user", expireTime = 1800)
    public User getUserInfo(){
        // 模拟数据库查询
        return new User(1L,"李四",22);
    }

    // ========== 2. 手动存入对象缓存 ==========
    public void saveUserCache(){
        User user = new User(2L,"王五",25);
        // 存入缓存 2小时过期
        redisCacheUtil.setCacheObj("user:info:2",user,7200);
    }

    // ========== 3. 手动读取对象缓存 ==========
    public User getUserCache(){
        return redisCacheUtil.getCacheObj("user:info:2",User.class);
    }

    // ========== 4. 缓存集合 ==========
    public void saveUserListCache(){
        List<User> userList = new ArrayList<>();
        userList.add(new User(3L,"赵六",20));
        userList.add(new User(4L,"孙七",23));
        redisCacheUtil.setCacheObj("user:list",userList);
    }
}
六、测试调用
java
运行
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import javax.annotation.Resource;
import java.util.List;

@SpringBootTest
public class CacheTest {

    @Resource
    private UserService userService;
    @Resource
    private RedisCacheUtil cacheUtil;

    @Test
    void testAnnoCache(){
        // 第一次查数据库，存入缓存
        System.out.println(userService.getUserInfo());
        // 第二次直接走缓存
        System.out.println(userService.getUserInfo());
    }

    @Test
    void testObjCache(){
        userService.saveUserCache();
        System.out.println(cacheUtil.getCacheObj("user:info:2",User.class));
    }
}
七、核心功能亮点
自动 JSON 序列化：直接存实体类、List 集合，不用手动转 JSON
统一过期管理：默认 1 小时，支持自定义秒级过期
注解一键缓存：业务方法加@CacheData自动实现缓存查询 + 存入
五大数据类型全覆盖：String/Hash/List/Set/ZSet
连接池自动管理：无需手动写获取关闭连接
空值防护：空对象不存入缓存，避免缓存穿透
八、项目新增目录
plaintext
com.xxx
├─ annotation
│  └─ CacheData.java       // 缓存注解
├─ aspect
│  └─ CacheAspect.java     // 缓存AOP切面
├─ util
│  └─ RedisCacheUtil.java // 高级缓存工具
九、常用场景推荐
首页热门数据 → 注解缓存
用户信息 → 序列化对象缓存
购物车 → Hash 缓存
消息队列 → List 缓存
排行榜 → ZSet 缓存
点赞去重 → Set 缓存
```

## **3.SpringDataRedis**

https://spring.io/projects/spring-data-redis

| Redis 数据类型           | RedisTemplate 获取方法              | 操作对象类型                 | 常用功能说明                           |
| ------------------------ | ----------------------------------- | ---------------------------- | -------------------------------------- |
| **字符串 String**        | `redisTemplate.opsForValue()`       | `ValueOperations<K,V>`       | set、get、incr、decr、过期时间         |
| **哈希 Hash**            | `redisTemplate.opsForHash()`        | `HashOperations<K,HK,HV>`    | hput、hget、hkeys、hvals、hgetAll      |
| **列表 List**            | `redisTemplate.opsForList()`        | `ListOperations<K,V>`        | lpush、rpush、lpop、rpop、lrange       |
| **集合 Set**             | `redisTemplate.opsForSet()`         | `SetOperations<K,V>`         | sadd、srem、smembers、sismember、scard |
| **有序集合 ZSet**        | `redisTemplate.opsForZSet()`        | `ZSetOperations<K,V>`        | zadd、zrange、zrem、zrank、zscore      |
| **基数统计 HyperLogLog** | `redisTemplate.opsForHyperLogLog()` | `HyperLogLogOperations<K,V>` | pfadd、pfcount                         |
| **地理位置 Geo**         | `redisTemplate.opsForGeo()`         | `GeoOperations<K,M>`         | geoadd、geopos、geodist、georadius     |
| **流 Stream**            | `redisTemplate.opsForStream()`      | `StreamOperations<K,HK,V>`   | xadd、xread、xrange                    |

### 1. Spring Data Redis

**Spring Data Redis** 是 Spring 全家桶里，**专门用来简化 Redis 操作**的框架，属于 **Spring Data** 系列组件。

**SpringDataRedis = Spring 封装好的 Redis 模板工具**

底层默认帮你整合了 **Lettuce**（也可切换 Jedis），不用自己写连接池、不用手动管理连接，直接开箱即用。

### 2.和你刚才写的 Jedis 对比

**1. Jedis**

- Redis **原生 Java 客户端**
- 原生 API，命令和 Redis 一模一样
- 需要**自己手写连接池、工具类、序列化**
- 配置繁琐，项目大了维护麻烦

**2. Spring Data Redis**

- **Spring 二次封装**
- 提供统一模板：`RedisTemplate`
- **自动管理连接池、自动序列化**
- 整合 SpringBoot，**零配置快速使用**
- 企业项目**主流首选**

------

### 3.底层客户端区别（重点）

SpringDataRedis 底层支持两种客户端：

1. **Lettuce（默认）**
   - 基于**Netty**，异步非阻塞
   - 线程安全，**多线程共用一个连接**
   - 无需连接池也够用，性能好
   - SpringBoot2.x+ 默认使用
2. **Jedis（你之前学的）**
   - 同步阻塞
   - **非线程安全**，必须配连接池
   - 老项目常用

**现在企业新项目统一用：SpringDataRedis + Lettuce**

### 4.Spring Data Redis 核心优点

1. 极致简化

   不用写连接池、不用获取关闭连接

2. 自带序列化

   默认 Jdk 序列化，可一键改成 

   JSON 序列化

3. 五大数据类型全覆盖

   ```
   StringRedisTemplate
   ```

   ```
   RedisTemplate
   ```

    直接操作

4. 完美整合 SpringBoot

   yml 一键配置主机、端口、密码、过期时间

5. **支持事务、管道、哨兵、集群**

6. 支持 缓存注解

   ```
   @Cacheable、@CachePut、@CacheEvict
   ```

   直接实现 声明式缓存，比自定义 AOP 更标准

------

### 5.两大核心模板（必记）

**1. StringRedisTemplate（最常用）**

- **只存字符串**
- key、value 都是 String
- **日常开发 90% 场景用它**
- 简单、无乱码、不用改序列化

**2. RedisTemplate<Object,Object>**

- 可以存**任意对象**
- 默认 JDK 序列化，key/value 会乱码
- 一般手动改成 **FastJSON/Jackson JSON 序列化**
- 适合缓存实体类、集合

------

### 6.最简使用流程（SpringBoot）

#### 1. 引入依赖

```
<!-- SpringDataRedis 起步依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

#### 2. yml 极简配置

```
spring:
  redis:
    host: localhost
    port: 6379
    password: #无密码空着
    database: 0
```

#### 3. 直接注入使用

```
@Autowired
private StringRedisTemplate stringRedisTemplate;

//存
stringRedisTemplate.opsForValue().set("name","张三");
//取
String name = stringRedisTemplate.opsForValue().get("name");
```

#### 4. 五大类型对应方法

```
//字符串
opsForValue()
//哈希
opsForHash()
//列表
opsForList()
//集合
opsForSet()
//有序集合
opsForZSet()
```

#### 5.代码示例

```

### 9.1 步骤一：创建 Maven 项目

创建标准的 Spring Boot 项目结构，并配置 `pom.xml`：

​```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
        <exclusions>
            <exclusion>
                <groupId>io.lettuce</groupId>
                <artifactId>lettuce-core</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <dependency>
        <groupId>redis.clients</groupId>
        <artifactId>jedis</artifactId>
        <version>5.1.0</version>
    </dependency>
    <!-- 其他依赖 -->
</dependencies>
​```

### 9.2 步骤二：配置 RedisTemplate

创建 `RedisConfig.java`，配置 JSON 序列化：

​```java
@Bean
public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
    RedisTemplate<String, Object> template = new RedisTemplate<>();
    template.setConnectionFactory(connectionFactory);
    
    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
    objectMapper.activateDefaultTyping(
        objectMapper.getPolymorphicTypeValidator(),
        ObjectMapper.DefaultTyping.NON_FINAL
    );
    
    GenericJackson2JsonRedisSerializer jsonSerializer = 
        new GenericJackson2JsonRedisSerializer(objectMapper);
    
    template.setKeySerializer(new StringRedisSerializer());
    template.setValueSerializer(jsonSerializer);
    
    return template;
}
​```

### 9.3 步骤三：创建实体类

​```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements Serializable {
    private Long id;
    private String username;
    private String email;
    private Integer age;
    private LocalDateTime createTime;
}
​```

### 9.4 步骤四：实现缓存服务

​```java
@Service
public class CacheService {
    
    @Cacheable(cacheNames = "userCache", key = "#userId")
    public User getUserById(Long userId) {
        // 模拟数据库查询
        return User.builder().id(userId).build();
    }
    
    @CachePut(cacheNames = "userCache", key = "#user.id")
    public User updateUser(User user) {
        // 模拟数据库更新
        return user;
    }
    
    @CacheEvict(cacheNames = "userCache", key = "#userId")
    public void deleteUser(Long userId) {
        // 模拟数据库删除
    }
}
​```

### 9.5 步骤五：实现数据结构服务

​```java
@Service
public class RedisDataStructureService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    
    public void setString(String key, String value) {
        redisTemplate.opsForValue().set(key, value);
    }
    
    public String getString(String key) {
        return (String) redisTemplate.opsForValue().get(key);
    }
    
    // 其他数据结构操作...
}
​```

### 9.6 步骤六：编写单元测试

​```java
@SpringBootTest
class SpringDataRedisTest {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private CacheService cacheService;
    
    @Autowired
    private RedisDataStructureService dataStructureService;
    
    @Test
    void testJsonSerialization() {
        User user = User.builder().id(1L).username("张三").build();
        redisTemplate.opsForValue().set("test:user:1", user);
        User result = (User) redisTemplate.opsForValue().get("test:user:1");
        assertNotNull(result);
    }
    
    // 其他测试方法...
}
```



### 7.三者学习顺序（最合理）

1. **原生 Redis 命令**（先会敲命令）
2. **Jedis**（理解底层客户端、连接池原理）
3. **Spring Data Redis**（企业实际开发干活用）

**面试标准答案：**

平时项目中使用 **Spring Data Redis** 操作 Redis，底层默认使用 **Lettuce** 客户端，也可切换为 Jedis；日常业务优先使用`StringRedisTemplate`做字符串缓存，复杂对象缓存自定义`RedisTemplate`实现 JSON 序列化，同时结合 Spring 缓存注解`@Cacheable`实现业务缓存开发。

### 8.简单总结

- **Jedis**：原生手动版
- **SpringDataRedis**：Spring 封装懒人版、企业标准版
- 以后工作**全都用 SpringDataRedis**，几乎没人手写 Jedis 工具类















SpringDataRedis中提供了RedisTemplate工具类，其中封装了各种对Redis的操作。并且将不同数据类型的操作API封装到了不同的类型中： 用表格表示



SpringDataRedis的使用步骤：
引入spring-boot-starter-data-redis依赖
在application.yml配置Redis信息
注入RedisTemplate

进行测试

4.序列化

RedisTemplate可以接收任意Object作为值写入Redis，只不过写入前会把Object序列化为字节形式，默认是采用JDK序列化，得到的结果是这样的

为了节省内存空间，我们并不会使用JSON序列化器来处理value，而是统一使用String序列化器，要求只能存储String类型的key和value。当需要存储Java对象时，手动完成对象的序列化和反序列化。

RedisTemplate的两种序列化实践方案：
方案一：
自定义RedisTemplate
修改RedisTemplate的序列化器为GenericJackson2JsonRedisSerializer
方案二：
使用StringRedisTemplate
写入Redis时，手动把对象序列化为JSON
读取Redis时，手动把读取到的JSON反序列化为对象

5.



# 缓存

**常用三大注解**

1. `@Cacheable`：查询缓存，有缓存不走方法，无则执行并存缓存
2. `@CachePut`：更新缓存，每次都执行方法，同步更新缓存
3. `@CacheEvict`：清除缓存
4. `@Caching`：组合注解

单机的Redis存在四大问题：

![](C:\Users\DELL\Desktop\笔记\数据库\img\Reids\单机存在的问题.png)

## 1.Redis持久化

Redis有两种持久化方案：

- RDB持久化
- AOF持久化

### 1.1.RDB持久化

RDB全称Redis Database Backup file（Redis数据备份文件），也被叫做Redis数据快照。简单来说就是把内存中的所有数据都记录到磁盘中。当Redis实例故障重启后，从磁盘读取快照文件，恢复数据。快照文件称为RDB文件，默认是保存在当前运行目录。

#### 1.1.1.执行时机

RDB持久化在四种情况下会执行：

- 执行save命令
- 执行bgsave命令
- Redis停机时
- 触发RDB条件时

**1）save命令**

执行下面的命令，可以立即执行一次RDB：

![image-20210725144536958](F:/资料/java/12.数据库/黑马Redis-笔记资料/03-高级篇/讲义/01-分布式缓存/assets/image-20210725144536958.png)

save命令会导致主进程执行RDB，这个过程中其它所有命令都会被阻塞。只有在数据迁移时可能用到。

**2）bgsave命令**

下面的命令可以异步执行RDB：

![image-20210725144725943](F:/资料/java/12.数据库/黑马Redis-笔记资料/03-高级篇/讲义/01-分布式缓存/assets/image-20210725144725943.png)

这个命令执行后会开启独立进程完成RDB，主进程可以持续处理用户请求，不受影响。

**3）停机时**

Redis停机时会执行一次save命令，实现RDB持久化。

**4）触发RDB条件**

Redis内部有触发RDB的机制，可以在redis.conf文件中找到，格式如下：

```properties
# 900秒内，如果至少有1个key被修改，则执行bgsave ， 如果是save "" 则表示禁用RDB
save 900 1  
save 300 10  
save 60 10000 
```

RDB的其它配置也可以在redis.conf文件中设置：

```properties
# 是否压缩 ,建议不开启，压缩也会消耗cpu，磁盘的话不值钱
rdbcompression yes

# RDB文件名称
dbfilename dump.rdb  

# 文件保存的路径目录
dir ./ 
```

#### 1.1.2.RDB原理

bgsave开始时会fork主进程得到子进程，子进程共享主进程的内存数据。完成fork后读取内存数据并写入 RDB 文件。

fork采用的是copy-on-write技术：

- 当主进程执行读操作时，访问共享内存；
- 当主进程执行写操作时，则会拷贝一份数据，执行写操作。

![image-20210725151319695](F:/资料/java/12.数据库/黑马Redis-笔记资料/03-高级篇/讲义/01-分布式缓存/assets/image-20210725151319695.png)





#### 1.1.3.小结

RDB方式bgsave的基本流程？

- fork主进程得到一个子进程，共享内存空间
- 子进程读取内存数据并写入新的RDB文件
- 用新RDB文件替换旧的RDB文件

RDB会在什么时候执行？save 60 1000代表什么含义？

- 默认是服务停止时
- 代表60秒内至少执行1000次修改则触发RDB

RDB的缺点？

- RDB执行间隔时间长，两次RDB之间写入数据有丢失的风险
- fork子进程、压缩、写出RDB文件都比较耗时



### 1.2.AOF持久化

#### 1.2.1.AOF原理

AOF全称为Append Only File（追加文件）。Redis处理的每一个写命令都会记录在AOF文件，可以看做是命令日志文件。

![image-20210725151543640](F:/资料/java/12.数据库/黑马Redis-笔记资料/03-高级篇/讲义/01-分布式缓存/assets/image-20210725151543640.png)



#### 1.2.2.AOF配置

AOF默认是关闭的，需要修改redis.conf配置文件来开启AOF：

```properties
# 是否开启AOF功能，默认是no
appendonly yes
# AOF文件的名称
appendfilename "appendonly.aof"
```



AOF的命令记录的频率也可以通过redis.conf文件来配：

```properties
# 表示每执行一次写命令，立即记录到AOF文件
appendfsync always 
# 写命令执行完先放入AOF缓冲区，然后表示每隔1秒将缓冲区数据写到AOF文件，是默认方案
appendfsync everysec 
# 写命令执行完先放入AOF缓冲区，由操作系统决定何时将缓冲区内容写回磁盘
appendfsync no
```



三种策略对比：

![image-20210725151654046](F:/资料/java/12.数据库/黑马Redis-笔记资料/03-高级篇/讲义/01-分布式缓存/assets/image-20210725151654046.png)



#### 1.2.3.AOF文件重写

因为是记录命令，AOF文件会比RDB文件大的多。而且AOF会记录对同一个key的多次写操作，但只有最后一次写操作才有意义。通过执行bgrewriteaof命令，可以让AOF文件执行重写功能，用最少的命令达到相同效果。

![image-20210725151729118](F:/资料/java/12.数据库/黑马Redis-笔记资料/03-高级篇/讲义/01-分布式缓存/assets/image-20210725151729118.png)

如图，AOF原本有三个命令，但是`set num 123 和 set num 666`都是对num的操作，第二次会覆盖第一次的值，因此第一个命令记录下来没有意义。

所以重写命令后，AOF文件内容就是：`mset name jack num 666`



Redis也会在触发阈值时自动去重写AOF文件。阈值也可以在redis.conf中配置：

```properties
# AOF文件比上次文件 增长超过多少百分比则触发重写
auto-aof-rewrite-percentage 100
# AOF文件体积最小多大以上才触发重写 
auto-aof-rewrite-min-size 64mb 
```



#### 1.3.RDB与AOF对比

RDB和AOF各有自己的优缺点，如果对数据安全性要求较高，在实际开发中往往会**结合**两者来使用。

![image-20210725151940515](F:/资料/java/12.数据库/黑马Redis-笔记资料/03-高级篇/讲义/01-分布式缓存/assets/image-20210725151940515.png)

## 2.多级缓存

**1.什么是多级缓存**

传统的缓存策略一般是请求到达Tomcat后，先查询Redis，如果未命中则查询数据库，如图：

![image-20210821075259137](F:/资料/java/12.数据库/黑马Redis-笔记资料/03-高级篇/讲义/02-多级缓存/assets/image-20210821075259137.png)

存在下面的问题：

•请求要经过Tomcat处理，Tomcat的性能成为整个系统的瓶颈

•Redis缓存失效时，会对数据库产生冲击

多级缓存就是充分利用请求处理的每个环节，分别添加缓存，减轻Tomcat压力，提升服务性能：

- 浏览器访问静态资源时，优先读取浏览器本地缓存
- 访问非静态资源（ajax查询数据）时，访问服务端
- 请求到达Nginx后，优先读取Nginx本地缓存
- 如果Nginx本地缓存未命中，则去直接查询Redis（不经过Tomcat）
- 如果Redis查询未命中，则查询Tomcat
- 请求进入Tomcat后，优先查询JVM进程缓存
- 如果JVM进程缓存未命中，则查询数据库

![image-20210821075558137](F:/资料/java/12.数据库/黑马Redis-笔记资料/03-高级篇/讲义/02-多级缓存/assets/image-20210821075558137.png)



在多级缓存架构中，Nginx内部需要编写本地缓存查询、Redis查询、Tomcat查询的业务逻辑，因此这样的nginx服务不再是一个**反向代理服务器**，而是一个编写**业务的Web服务器了**。



因此这样的业务Nginx服务也需要搭建集群来提高并发，再有专门的nginx服务来做反向代理，如图：

![image-20210821080511581](F:/资料/java/12.数据库/黑马Redis-笔记资料/03-高级篇/讲义/02-多级缓存/assets/image-20210821080511581.png)



另外，我们的Tomcat服务将来也会部署为集群模式：

![image-20210821080954947](F:/资料/java/12.数据库/黑马Redis-笔记资料/03-高级篇/讲义/02-多级缓存/assets/image-20210821080954947.png)



可见，多级缓存的关键有两个：

- 一个是在nginx中编写业务，实现nginx本地缓存、Redis、Tomcat的查询

- 另一个就是在Tomcat中实现JVM进程缓存

其中Nginx编程则会用到OpenResty框架结合Lua这样的语言。

# 实战

# Redis 最全最佳实践（面试 + 工作通用）

## 一、基础使用规范

1.**命令规范**

- 开发测试用 `keys *`，**生产绝对禁用**，改用 `scan` 遍历
- 拒绝长事务、大量 `mget/mset` 一次性批量超大键值
- 禁用 `flushall / flushdb` 线上随意执行

**2.键名命名规范**

格式：

```
业务:模块:id
```

示例：

```
user:info:1001
```

```
order:pay:2026
```

- 统一分隔符用冒号 `:`
- 长度不宜过长，简洁易懂
- 不要中文、特殊字符、空格

3.**合理选择 5 大数据类型**

| 业务场景 | 推荐类型 |

|----|----|

| 普通缓存、手机号、配置 | String |

| 购物车、消息队列、浏览记录 | List |

| 好友、点赞、共同关注 | Set |

| 用户信息、商品详情 | Hash |

| 排行榜、积分排序、成绩 | ZSet |

## 二、缓存设计最佳实践

### 1. 三大缓存问题解决方案

1. **缓存穿透**

- 原因：查不存在数据，直打数据库
- 方案：空值缓存、布隆过滤器、接口限流

1. **缓存击穿**

- 原因：热点 key 过期瞬间大量请求打库
- 方案：**永不过期**、互斥锁、热点 key 永续期

1. **缓存雪崩**

- 原因：大量 key 同时过期 / Redis 宕机
- 方案：过期时间加随机值、集群高可用、服务熔断降级

### 2. 过期时间设置

- 缓存统一加过期时间，**禁止大量永久 Key**
- 热门数据：30 分钟～2 小时
- 临时数据：5~10 分钟
- 批量 key 过期时间**加随机偏移**，避免集体失效

## 三、内存优化

1. 禁用大 Key

- String 建议小于 **10KB**
- Hash/List/Set 元素数量控制在千级以内
- 大 key 拆分存储

1. 内存淘汰策略（线上必配）

   优先使用：

plaintext

```
allkeys-lru  # 优先淘汰最近最少使用key
```

1. 关闭无用持久化，纯缓存业务只开 RDB 即可

## 四、持久化最佳实践

1. **纯缓存业务**：只开 RDB，关闭 AOF
2. **数据不能丢业务**：RDB+AOF 双开
3. 不使用 AOF 秒级刷盘，性能极低

## 五、集群与高可用

1. 单机只用于**开发测试**
2. 线上正式环境必用：**主从 + 哨兵** 实现自动故障转移
3. 海量数据分片用 **Redis Cluster 集群**
4. 主库只写，从库只读，读写分离

## 六、业务场景最佳实践

1. **登录验证码**：String + 5 分钟过期
2. **用户登录 token**：String + 30 分钟过期，自动续期
3. **购物车**：Hash 结构存储
4. **朋友圈时间线**：List 链表
5. **点赞 / 好友**：Set 集合
6. **直播间榜单 / 积分排行**：ZSet 有序集合
7. **限流防刷**：String 计数器 + 过期时间

## 七、代码层面规范

1. 统一封装 Redis 工具类，统一序列化方式
2. 操作 Redis 加**异常捕获**，超时重试控制次数
3. 先查缓存，未命中再查数据库
4. 更新数据库**同步更新 / 删除缓存**（先更库再删缓存）
5. 批量操作尽量用 `mget mset` 减少网络 IO

## 八、安全最佳实践

1. 设置 Redis 密码，禁止空密码
2. 禁止外网直接暴露 6379 端口
3. 绑定内网 IP 访问，禁止 0.0.0.0 全网监听
4. 重命名危险命令：`flushdb、keys、config`

## 九、运维监控

1. 监控：内存使用率、客户端连接数、命中率、过期 key 数量
2. 慢查询日志开启，排查慢命令
3. 定期清理无效垃圾 Key
4. 定时备份 RDB 数据

## 十、极简总结（背诵版）

1. 键名规范，类型选对
2. 线上禁用 keys，多用 scan
3. 解决穿透、击穿、雪崩三大问题
4. 严控大 Key，合理使用内存淘汰
5. 线上不用单机，必做哨兵 / 集群
6. 密码 + 内网隔离做好安全
7. 缓存统一加过期，错开过期时间
8. 读写分离，缓存与数据库双写一致

# 原理

# 集群部署

# Redis 必会面试简答题

1. **Redis 是什么？**

   开源高性能**内存键值数据库**，支持多数据类型，支持持久化、集群，常做缓存、计数器、分布式锁。

2. **Redis 默认端口、默认数据库数量？**

   默认端口**6379**，默认**16**个数据库，0-15 编号。

3. **Redis 是单线程吗？**

   核心读写命令**单线程**，持久化、后台清理、网络 IO 采用多线程。

4. **单线程 Redis 为什么速度快？**

   纯内存操作、IO 多路复用、数据结构高效、无线程锁竞争。

5. **Redis 五大常用数据类型+四种增强？**

   String、List、Hash、Set、ZSet。 Geospatial，HyperLogLog ， Bitmap，Stream

6. **String底层结构和用途**                                                                                                                                                           

    简单动态字符串（SDS）场景：缓存、计数器、分布式 ID、手机号验证码

7. **List 底层结构与用途？**

   底层**双向链表**，有序可重复；做消息队列、浏览记录、时间线。

8. **Hash 适合存储什么数据？**

   **ziplist（压缩列表） + hashtable（字典)**适合存储**对象数据**，如用户信息、商品信息，节省内存。

9. **Set 集合特点与场景？**

   intset 整数集合,hashtable 字典,无序、自动去重；用于好友关系、共同好友、点赞、去重统计。

10. **ZSet 有序集合特点？**

   压缩列表 ziplist + 跳表 skiplist,有序、去重、带分数排序；用于排行榜、积分排名、延时任务。

11. **Redis 两种持久化方式？**

    **RDB 快照**、**AOF 日志**。

12. **RDB 和 AOF 区别？**

    RDB 定时存快照，恢复快、可能丢数据；AOF 记录每条写命令，数据更安全。

13. **Redis 过期键删除策略？**

    **惰性删除 + 定期删除**组合策略。

14. **Redis 内存淘汰常用策略？**

    生产常用 **allkeys-lru**，淘汰最近最少使用的 key。

15. **什么是缓存穿透？怎么解决？**

    查询不存在数据直达数据库；解决：空值缓存、布隆过滤器、接口校验。

16. **什么是缓存击穿？怎么解决？**

    热点 key 过期，大量请求打数据库；解决：永不过期、分布式锁。

17. **什么是缓存雪崩？怎么解决？**

    大量 key 同时过期或 Redis 宕机；解决：过期加随机值、集群高可用、熔断降级。

18. **Redis 事务支持回滚吗？**

    **不支持**，语法错误整体失败，运行出错不会回滚。

19. **Redis 如何实现分布式锁？**

    `set key value nx ex 过期时间`，保证原子性，设置过期防死锁。

20. **主从复制、哨兵、集群作用？**

    主从：数据备份、读写分离；哨兵：自动故障转移；Cluster 集群：分片扩容存海量数据。

21. **生产环境为什么禁用 keys \*？**                                                                                                                            遍历所有 key 阻塞主线程，大数据量会卡死 Redis，线上用 scan 迭代遍历。

22. **scan如何遍历的**

    AN 采用**游标分批迭代**方式，首次游标为 0，每次执行返回新游标与部分 key，开发者持续使用新游标遍历，直到再次返回游标 0 代表遍历完成。它非阻塞遍历，不会阻塞 Redis 主线程，解决 keys * 卡顿问题，适合线上生产环境使用。

23. **Redis 特点**

- 单线程模型（6.0 后多线程 IO）
- 纯内存、速度快
- 支持持久化
- 原子操作
- 支持事务、发布订阅、Lua 脚本