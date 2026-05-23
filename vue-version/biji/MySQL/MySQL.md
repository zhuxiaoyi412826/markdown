**必会知识点**

1. 数据库 / 表概念、关系型数据库理解，表设计三大范式
2. MySQL 安装、命令行连接、图形工具使用、Linux下安装远程使用
3. 三大数据类型：**数值、字符串、日期**SQL 四大分类：**DDL / DML / DQL / DCL** 表约束：主键、非空、唯一、默认值、外键
4. **DQL 查询全套语法**（重中之重）
5. 多表左连接（工作 90% 用 LEFT JOIN）单行子查询、多行子查询
6. GROUP BY 分组统计
7. 窗口函数分组排名
8. 数据类型选型（金额用 DECIMAL，不用浮点）
9. 索引使用、索引失效
10. 事务隔离级别、三大读问题
11. SQL 优化、explain 执行计划
12. 视图 存储 触发器

# 第一阶段：基础必会（入门必学）

## MySQL

**关系型数据库**：用**二维表格**存储数据，表和表之间**有关系**（关联），遵循固定结构、严格规范。

基于二维表存储 数据的数据库就成为关系型数据库，

不是基于二维表存储数据的数据库，就是非关系型数据库，

远程连接   mysql -h 远程IP -P 3307 -u 用户名 -p

如果 连接本地的MySQL，则无需指定这两个参数

**SQL** 全称 Structured  Query Language，结构化查询语言。操作关系型数据库的编程语言，定义了 一套操作关系型数据库统一标准

语法

```
1. SQL语句可以单行或多行书写，以分号结尾。
2. SQL语句可以使用空格/缩进来增强语句的可读性。
3. MySQL数据库的SQL语句不区分大小写，关键字建议使用大写。
4. 注释：
单行注释：-- 注释内容  或  # 注释内容
多行注释：/* 注释内容 */
```

| 分类    | 中文名称     | 核心功能                                      | 常用关键字                            | 典型操作                                      |
| ------- | ------------ | --------------------------------------------- | ------------------------------------- | --------------------------------------------- |
| **DDL** | 数据定义语言 | 定义 / 管理**数据库、表结构**，操作库和表本身 | `CREATE`、`ALTER`、`DROP`、`TRUNCATE` | 建库、建表、改表结构、删除库 / 表、清空表结构 |
| **DML** | 数据操作语言 | 操作**表里面的数据**（增删改）                | `INSERT`、`UPDATE`、`DELETE`          | 插入数据、修改数据、删除数据                  |
| **DQL** | 数据查询语言 | **查询**表数据，只查不改                      | `SELECT`                              | 查询单表、多表、分组、排序、分页、子查询      |
| **DCL** | 数据控制语言 | 管理**权限、用户授权**                        | `GRANT`、`REVOKE`                     | 给用户授权、撤销用户权限                      |

## **DDL** 

**数据库操作**

show database;  查询所有数据库

select database(); 查询当前数据库

创建数据库

create database [ if not exists ] 数据库名 [ default charset 字符集 ] [ collate 排序 规则 ] ;

create database itcast;

CREATE DATABASE IF NOT EXISTS db_agent DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

if not exists 参数来解决这个问题，数据库不存在, 则创建该数据库，如果存在，则不 创建

CREATE DATABASE  IF NOT EXISTS tice;

创建一个数据库并指定字符集

CREATE DATABASE zxy DEFAULT CHARSET utf8mb4;

删除数据库，加上参数 if exists ，如果数据库存在，再 执行删除，否则不执行删除

DROP DATABASE IF EXISTS zxy;

切换数据库 

use 

**表操作**

查询当前数据库所有表

show tables

我们可以查看到指定表的字段，字段的类型、是否可以为NULL，是否存在默认值等信

desc 表名

主要是用来查看建表语句的

SHOW CREATE TABLE users;

创建表

```
CREATE TABLE  表名(
字段1  字段1类型 [ COMMENT  字段1注释 ],
字段2  字段2类型 [COMMENT  字段2注释 ],
字段3  字段3类型 [COMMENT  字段3注释 ],
 ......
字段n  字段n类型 [COMMENT  字段n注释 ] 
) [ COMMENT  表注释 ] ;
```

最后一个字段没有逗号

```
CREATE TABLE tb_user(
id INT COMMENT '编号',
NAME VARCHAR(50) COMMENT '姓名',
age INT COMMENT '年龄',
gender VARCHAR(1) COMMENT '性别'
)COMMENT '用户表';
```

数值类型

| 类型名称      | 占用空间 | 取值范围                 | 说明                             |
| ------------- | -------- | ------------------------ | -------------------------------- |
| TINYINT       | 1 字节   | -128 ~ 127               | 极小整数，可用存状态、性别、开关 |
| SMALLINT      | 2 字节   | -32768 ~ 32767           | 小整数                           |
| INT / INTEGER | 4 字节   | -2147483648 ~ 2147483647 | **最常用**，存 id、年龄、数量    |
| BIGINT        | 8 字节   | 超大范围                 | 长整型，存雪花 ID、大编号        |
| FLOAT         | 4 字节   | 单精度浮点数             | 小数，精度低                     |
| DOUBLE        | 8 字节   | 双精度浮点数             | 普通小数、金额粗略存储           |
| DECIMAL(m,n)  | 可变     | 自定义精度               | **金融金额专用**，精准不丢失精度 |

字符串类型

| 类型名称   | 特点     | 最大长度     | 使用场景                         |
| ---------- | -------- | ------------ | -------------------------------- |
| CHAR(n)    | 固定长度 | 0~255 字符   | 手机号、身份证、固定编码         |
| VARCHAR(n) | 可变长度 | 0~65535 字符 | **最常用**，姓名、地址、普通文本 |
| TEXT       | 长文本   | 65535 字符   | 文章内容、评论、大段文字         |
| MEDIUMTEXT | 更长文本 | 1600 万字符  | 大篇幅文章                       |
| LONGTEXT   | 超长文本 | 42 亿字符    | 超大文本、富文本                 |

日期类型

| 类型名称  | 格式                  | 占用空间 | 适用场景                       |
| --------- | --------------------- | -------- | ------------------------------ |
| DATE      | `yyyy-MM-dd`          | 3 字节   | 只存日期：生日、下单日期       |
| TIME      | `HH:mm:ss`            | 3 字节   | 只存时间                       |
| DATETIME  | `yyyy-MM-dd HH:mm:ss` | 8 字节   | **最常用**，创建时间、更新时间 |
| TIMESTAMP | 时间戳转日期          | 4 字节   | 时区自动转换，范围较小         |
| YEAR      | `yyyy`                | 1 字节   | 只存年份                       |

创建指定表

```
1.编号（纯数字）
2. 员工工号 (字符串类型，长度不超过10位)
3. 员工姓名（字符串类型，长度不超过10位）
4. 性别（男/女，存储一个汉字）
5. 年龄（正常人年龄，不可能存储负数）
6. 身份证号（二代身份证号均为18位，身份证中有X这样的字符）
7. 入职时间（取值年月日即可
```

```
CREATE TABLE emp(
id INT COMMENT '编号',
workno VARCHAR(10) COMMENT '工号',
NAME VARCHAR(10) COMMENT '姓名',
gender CHAR(1) COMMENT '性别',
age TINYINT UNSIGNED COMMENT '年龄',
idcard CHAR(18) COMMENT '身份证号码',
entrydate DATE COMMENT '入职时间'
)COMMENT '员工表';
```

增加字段

为emp表增加一个新的字段”昵称”为nickname，类型为varchar(20)

```
 ALTER TABLE 表名 ADD  字段名  类型 (长度)  [ COMMENT 注释 ]  [ 约束 ];
```

 ALTER TABLE emp ADD nickname VARCHAR(20)  COMMENT '昵称';

修改数据类型

```
ALTER TABLE 表名 MODIFY  字段名  新数据类型 (长度);
```

 ALTER TABLE emp MODIFY nickname VARCHAR(10);

修改字段名和字段类型

```
 ALTER TABLE 表名 CHANGE  旧字段名  新字段名  类型 (长度)  [ COMMENT 注释 ]  [ 约束 ];
```

ALTER TABLE emp CHANGE nickname nicknamee VARCHAR(30);

删除字段名

```
 ALTER TABLE 表名 DROP  字段名;
```

ALTER TABLE emp DROP nicknamee 

修改表名

```
 ALTER TABLE 表名 RENAME TO  新表名
```

ALTER TABLE emp RENAME TO empp;

删除表

```
DROP  TABLE [ IF  EXISTS ]  表名;
```

DROP TABLE IF EXISTS emp;

可选项 IF EXISTS 代表，只有表名存在时才会删除该表，表名不存在，则不执行删除操作(如果不 加该参数项，删除一张不存在的表，执行将会报错)。

删除表后重新创建表

删除表后数据也会删除

TRUNCATE TABLE emp

## **DML**

DML英文全称是Data Manipulation Language(数据操作语言)，用来对数据库中表的数据记录进 行增、删、改操作。 

- 添加数据（INSERT）
- 修改数据（UPDATE）
- 删除数据（DELETE）

给指定字段增加数据

```
INSERT INTO 表名 (字段名1, 字段名2, ...)  VALUES (值1, 值2, ...);
```

```
INSERT INTO emp(id,workno,NAME,gender,age,idcard,entrydate) VALUES(1,'1','ITcast','男',19,'123456789987654321','2004-10-01')
```

给全部字段添加数据

 INSERT INTO 表名 VALUES (值1, 值2, ...);

INSERT INTO emp VALUES(2,'2','zxy','女',22,'987654321123456789','2000-07-07')

批量添加数据

```
 INSERT INTO 表名 (字段名1, 字段名2, ...)  VALUES (值1, 值2, ...), (值1, 值2, ...), (值
1, 值2, ...) 
```

```
 INSERT INTO 表名 VALUES (值1, 值2, ...), (值1, 值2, ...), (值1, 值2, ...) ;
```

```
 INSERT INTO emp VALUES(3,'3','韦一笑','男',38,'123456789012345670','1987-01-01'),(4,'4','赵敏','女',18,'123456789012345670','2005-01-01');
```

修改数据

```
UPDATE   表名   SET   字段名1 = 值1 , 字段名2 = 值2 , .... [ WHERE  条件 ] ;
```

```
UPDATE emp SET NAME ='ithema' WHERE id=1;
```

```
UPDATE emp SET NAME = '小昭' , gender = '女' WHERE id = 1;
```

修改语句的条件可以有，也可以没有，如果没有条件，则会修改整张表的所有数据

```
UPDATE emp SET entrydate='2008-01-01';
```

删除数据

```
 DELETE  FROM  表名  [ WHERE  条件 ] ;
```

```
DELETE FROM emp WHERE gender='男';
```

```
 delete from employee;
```

-  DELETE 语句的条件可以有，也可以没有，如果没有条件，则会删除整张表的所有数 据。
-  DELETE 语句不能删除某一个字段的值(可以使用UPDATE，将该字段值置为NULL即 可)。
-  当进行删除全部数据操作时，datagrip会提示我们，询问是否确认删除，我们直接点击 Execute即可

## DQL

DQL英文全称是Data Query Language(数据查询语言)，数据查询语言，用来查询数据库中表的记 录。

 查询关键字: SELECT 在一个正常的业务系统中，查询操作的频次是要远高于增删改的，

当我们去访问企业官网、电商网站， 在这些网站中我们所看到的数据，实际都是需要从数据库中查询并展示的。而且在查询的过程中，可能 还会涉及到条件、排序、分页等操作。

数据准备

```
 drop table if exists employee;
 create table emp(
 id int comment '编号',
 workno varchar(10) comment '工号',
 name varchar(10) comment '姓名',
 gender char(1) comment '性别',
 age tinyint unsigned comment '年龄',
 idcard char(18) comment '身份证号',
 workaddress varchar(50) comment '工作地址',
 entrydate date comment '入职时间'
 )comment '员工表';
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (1, '00001', '柳岩666', '女', 20, '123456789012345678', '北京', '2000-01
01');
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (2, '00002', '张无忌', '男', 18, '123456789012345670', '北京', '2005-09
01');
16
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (3, '00003', '韦一笑', '男', 38, '123456789712345670', '上海', '2005-08
01');
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (4, '00004', '赵敏', '女', 18, '123456757123845670', '北京', '2009-12-01');
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (5, '00005', '小昭', '女', 16, '123456769012345678', '上海', '2007-07-01');
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (6, '00006', '杨逍', '男', 28, '12345678931234567X', '北京', '2006-01-01');
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (7, '00007', '范瑶', '男', 40, '123456789212345670', '北京', '2005-05-01');
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (8, '00008', '黛绮丝', '女', 38, '123456157123645670', '天津', '2015-05
01');
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (9, '00009', '范凉凉', '女', 45, '123156789012345678', '北京', '2010-04
01');
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (10, '00010', '陈友谅', '男', 53, '123456789012345670', '上海', '2011-01
01');
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (11, '00011', '张士诚', '男', 55, '123567897123465670', '江苏', '2015-05
01');
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (12, '00012', '常遇春', '男', 32, '123446757152345670', '北京', '2004-02
01');
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (13, '00013', '张三丰', '男', 88, '123656789012345678', '江苏', '2020-11
01');
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (14, '00014', '灭绝', '女', 65, '123456719012345670', '西安', '2019-05
01');
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
VALUES (15, '00015', '胡青牛', '男', 70, '12345674971234567X', '西安', '2018-04
01');
 INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) 
29
 VALUES (16, '00016', '周芷若', '女', 18, null, '北京', '2012-06-01');

```

```
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES 
(1, '00001', '柳岩666', '女', 20, '123456789012345678', '北京', '2000-01-01'),
(2, '00002', '张无忌', '男', 18, '123456789012345670', '北京', '2005-09-01'),
(3, '00003', '韦一笑', '男', 38, '123456789712345670', '上海', '2005-08-01'),
(4, '00004', '赵敏', '女', 18, '123456757123845670', '北京', '2009-12-01'),
(5, '00005', '小昭', '女', 16, '123456769012345678', '上海', '2007-07-01'),
(6, '00006', '杨逍', '男', 28, '12345678931234567X', '北京', '2006-01-01'),
(7, '00007', '范瑶', '男', 40, '123456789212345670', '北京', '2005-05-01'),
(8, '00008', '黛绮丝', '女', 38, '123456157123645670', '天津', '2015-05-01'),
(9, '00009', '范凉凉', '女', 45, '123156789012345678', '北京', '2010-04-01'),
(10, '00010', '陈友谅', '男', 53, '123456789012345670', '上海', '2011-01-01'),
(11, '00011', '张士诚', '男', 55, '123567897123465670', '江苏', '2015-05-01'),
(12, '00012', '常遇春', '男', 32, '123446757152345670', '北京', '2004-02-01'),
(13, '00013', '张三丰', '男', 88, '123656789012345678', '江苏', '2020-11-01'),
(14, '00014', '灭绝', '女', 65, '123456719012345670', '西安', '2019-05-01'),
(15, '00015', '胡青牛', '男', 70, '12345674971234567X', '西安', '2018-04-01'),
(16, '00016', '周芷若', '女', 18, NULL, '北京', '2012-06-01');
```

查询语法

```
SELECT
    字段列表
FROM
    表名列表
WHERE
    条件列表
GROUP  BY
    分组字段列表
HAVING
    分组后条件列表
ORDER BY
    排序字段列表
LIMIT
    分页参数
```

基本查询（不带任何条件） 

条件查询（WHERE） 

聚合函数（count、max、min、avg、sum） 

分组查询（group by）

 排序查询（order by） 

分页查询（limit）

**基础查询**

查询多个字段

```
SELECT   字段1, 字段2, 字段3 ...  FROM   表名 ;
```

查询全部字段

```
select * from emp
```

字段设置别名

```
SELECT id AS 'id序号', age AS '年龄' FROM emp 
```

去重

```
SELECT DISTINCT age,entrydate FROM emp
```

**条件查询**

```
SELECT  字段列表  FROM   表名   WHERE   条件列表 ;
```

| 运算符                | 作用                   | 示例                    |
| --------------------- | ---------------------- | ----------------------- |
| `=`                   | 等于                   | `age = 18`              |
| `<>` / `!=`           | 不等于                 | `age <> 18`             |
| `>`                   | 大于                   | `age > 20`              |
| `<`                   | 小于                   | `age < 30`              |
| `>=`                  | 大于等于               | `age >= 18`             |
| `<=`                  | 小于等于               | `age <= 60`             |
| `BETWEEN ... AND ...` | 在某个闭区间范围内     | `age BETWEEN 18 AND 30` |
| `IN(值1,值2...)`      | 在指定集合中           | `age IN(18,20,25)`      |
| `LIKE`                | 模糊查询（匹配字符串） | `name LIKE '%张%'`      |
| `IS NULL`             | 判断为空值             | `idcard IS NULL`        |
| `IS NOT NULL`         | 判断不为空值           | `idcard IS NOT NULL`    |

| 运算符 | 作用                     | 示例                     |
| ------ | ------------------------ | ------------------------ |
| `AND`  | 并且（同时满足多个条件） | `age>18 AND gender='男'` |
| `OR`   | 或者（满足任意一个条件） | `age<18 OR age>60`       |
| `NOT`  | 非、取反                 | `NOT age=18`             |

查询年龄等于 88 的员工

```
SELECT * FROM emp WHERE age=88;
```

 查询年龄小于等于 20 的员工信息

```
 SELECT * FROM emp WHERE age<20;
```

 查询没有身份证号的员工信息

```
 SELECT * FROM emp WHERE idcard IS NULL 
```

查询有身份证号的员工信息

```
 SELECT * FROM emp WHERE idcard IS NULL 
```

查询年龄不等于 88 的员工信息

```
SELECT * FROM emp WHERE age<>88
```

查询年龄在15岁(包含) 到 20岁(包含)之间的员工信息

```
 SELECT * FROM emp WHERE age >= 15 && age <= 20;
 SELECT * FROM emp WHERE age >= 15 AND age <= 20;
 SELECT * FROM emp WHERE age BETWEEN 15 AND 20
```

查询性别为 女 且年龄小于 25岁的员工信息

SELECT * FROM emp WHERE gender='女' AND age < 25

查询年龄等于18 或 20 或 40 的员工信息

```
SELECT * FROM emp WHERE age IN(18,20,40);
 SELECT * FROM emp WHERE age=18 OR age =20 OR age=40
```

查询姓名为两个字的员工信息 _ %

```
SELECT * FROM emp WHERE NAME LIKE '__'
```

查询身份证号最后一位是X的员工信息

```
SELECT * FROM emp WHERE idcard LIKE'%X'
```

**聚合函数**

```
SELECT  聚合函数(字段列表)  FROM   表名 ;
```

| 聚合函数  | 作用说明              | 用法示例                                              |
| --------- | --------------------- | ----------------------------------------------------- |
| `COUNT()` | 统计**行数 / 记录数** | `COUNT(*)` 统计所有行`COUNT(字段)` 统计该字段非空行数 |
| `SUM()`   | 求和（只针对数值型）  | `SUM(age)` 求年龄总和                                 |
| `AVG()`   | 求平均值              | `AVG(age)` 求平均年龄                                 |
| `MAX()`   | 求最大值              | `MAX(age)` 最大年龄                                   |
| `MIN()`   | 求最小值              | `MIN(age)` 最小年龄                                   |

注意 : NULL值是不参与所有聚合函数运算的。

常和 `GROUP BY` 分组一起用

统计该企业员工数量

```
select count(*) from emp; -- 统计的是总记录数
select count(idcard) from emp; -- 统计的是idcard字段不为null的记录数
```

| 写法            | 统计规则           | 是否忽略 NULL | 作用                                    |
| --------------- | ------------------ | ------------- | --------------------------------------- |
| `count(*)`      | 统计整行           | 不忽略        | 统计表**总记录行数**                    |
| `count(1)`      | 固定写 1，逐行计数 | 不忽略        | 统计表**总记录行数**，和 count (*) 一样 |
| `count(字段名)` | 只统计字段有值的行 | **忽略 NULL** | 统计该字段**非空**的行数                |

统计该企业员工的平均年龄

```
select avg(age) from emp;
```

统计该企业员工的最大年龄

```
select max(age) from emp;
```

 统计该企业员工的最小年龄

```
 select min(age) from emp;
```

统计西安地区员工的年龄之和

```
SELECT SUM(age) FROM emp WHERE workaddress= '西安'
```

**分组查询**

```
SELECT  字段列表  FROM   表名  [ WHERE   条件 ]  GROUP   BY  分组字段名  [ HAVING  分组 后过滤条件 ];
```

where和having的区别

**WHERE**：先把**不符合条件的行**直接筛掉，**还没分组**

**HAVING**：已经分好组、算完聚合，再把**不符合条件的分组**筛掉

| 区别维度       | WHERE                                 | HAVING                   |
| -------------- | ------------------------------------- | ------------------------ |
| 作用时机       | **分组之前**过滤行                    | **分组之后**过滤分组结果 |
| 过滤对象       | 过滤**原始表数据行**                  | 过滤**分组后的结果**     |
| 能否用聚合函数 | **不能**用聚合函数 (COUNT/SUM/AVG 等) | **可以**用聚合函数       |
| 执行顺序       | 先 WHERE → 再 GROUP BY → 后 HAVING    | 分组完再筛选             |
| 依赖分组       | 不需要 GROUP BY                       | 一般配合 GROUP BY 使用   |

 执行顺序: where > 聚合函数 > having 。

  支持多字段分组, 具体语法为 : group by columnA,columnB

A.根据性别分组 , 统计男性员工 和 女性员工的数量 

```
 select gender, count(*) from emp group by gender ; 
```

B. 根据性别分组 , 统计男性员工 和 女性员工的平均年龄

```
 select gender, avg(age) from emp group by gender 
```

C. 查询年龄小于45的员工 , 并根据工作地址分组 , 获取员工数量大于等于3的工作地址

```
  select workaddress, count(*) address_count from emp where age < 45 group by  workaddress having address_count >= 3; 
```

D. 统计各个工作地址上班的男性及女性员工的数量

```
 select workaddress, gender, count(*) '数量' from emp group by gender , workaddress
```

**排序查询**

```
 SELECT  字段列表  FROM   表名  ORDER  BY  字段1  排序方式1 , 字段2  排序方式2 ;
```

ASC : 升序(默认值) DESC: 降

A. 根据年龄对公司的员工进行升序排序 

```
select * from emp order by age asc; select * from emp order by age; 
```

B. 根据入职时间, 对员工进行降序排序 

```
select * from emp order by entrydate desc;
```

C. 根据年龄对公司的员工进行升序排序 , 年龄相同 , 再按照入职时间进行降序排序 

```
select * from emp order by age asc , entrydate desc;
```

**分页查询**

 SELECT  字段列表  FROM   表名  LIMIT  起始索引, 查询记录数 ;

 起始索引从0开始，起始索引 = （查询页码 - 1）* 每页显示记录数。

  分页查询是数据库的方言，不同的数据库有不同的实现，MySQL中是LIMIT。

 如果查询的是第一页数据，起始索引可以省略，直接简写为 limit 10。

 A. 查询第1页员工数据, 每页展示10条记录 

```
 select * from emp limit 0,10; select * from emp limit 10; 
```

B. 查询第2页员工数据, 每页展示10条记录 --------> (页码-1)*页展示记录数 

```
 select * from emp limit 10,10;
```

1.查询年龄为20,21,22,23岁的员工信息。 

```
select * from emp where gender = '女' and age in(20,21,22,23);
```

2. 查询性别为 男 ，并且年龄在 20-40 岁(含)以内的姓名为三个字的员工。

```
 select * from emp where gender = '男' and ( age between 20 and 40 ) and name like  '___'; 
```

3.统计员工表中, 年龄小于60岁的 , 男性员工和女性员工的人数。

```
 select gender, count(*) from emp where age < 60 group by gender; 
```

4.查询所有年龄小于等于35岁员工的姓名和年龄，并对查询结果按年龄升序排序，如果年龄相同按 入职时间降序排序。 

```
 select name , age from emp where age <= 35 order by age asc , entrydate desc;
```

5.查询性别为男，且年龄在20-40 岁(含)以内的前5个员工信息，对查询的结果按年龄升序排序， 年龄相同按入职时间升序排序。

```
 select * from emp where gender = '男' and age between 20 and 40 order by age asc ,  entrydate asc limit 5 ;
```

执行shunx实**执行顺序**（MySQL 内部干活顺序）

**1. FROM** → 先找表、加载数据

**2. WHERE** → 过滤原始行，筛掉不符合的数据

**3. GROUP BY** → 把剩下的数据进行分组

**4. 聚合函数** → 每组执行 COUNT、SUM、AVG 等统计

**5. HAVING** → 对**分组后的结果**再次过滤

**6. SELECT** → 挑选要显示的字段、起别名

**7. ORDER BY** → 对最终结果排序

**8. LIMIT** → 截取分页，取指定条数

**从表找数据 → Where 筛行 → Group 分组 → Having 筛组 → Select 选字段 → Order 排序 → Limit 分页**

## **DCL**  

DCL英文全称是Data Control Language(数据控制语言)，用来管理数据库用户、控制数据库的访 问权限

查询数据库的用户

```
SELECT * FROM mysql.user;
```

-- 创建用户 itcast , 只能够在当前主机localhost访问, 密码123456;

```
create user 'itcast'@'localhost' identified by '123456';
```

-- 创建用户 heima , 可以在任意主机访问该数据库, 密码123456 ;

```
create user 'heima'@'%' identified by '123456';
```

-- 修改用户 heima 的访问密码为 1234 ;

```
alter user 'heima'@'%' identified with mysql_native_password by '1234';
```

-- 删除itcast@localhost用户

```
drop user 'itcast'@'localhost';
```

-- 查询权限

```
show grants for 'heima'@'%';
```

-- 授予权限

```
grant all on itcast.* to 'heima'@'%';
```

-- 撤销权限

```
revoke all on itcast.* from 'heima'@'%';
```

| 权限名称         | 作用说明               | 适用场景                 |
| ---------------- | ---------------------- | ------------------------ |
| `SELECT`         | 查询表数据             | 普通查看数据             |
| `INSERT`         | 插入数据               | 新增记录                 |
| `UPDATE`         | 修改数据               | 更新表中字段             |
| `DELETE`         | 删除数据               | 删除表记录               |
| `CREATE`         | 创建数据库 / 表        | 建库、建表               |
| `ALTER`          | 修改表结构             | 改字段、加索引、改表结构 |
| `DROP`           | 删除数据库 / 表        | 删库、删表               |
| `INDEX`          | 创建 / 删除索引        | 管理索引                 |
| `GRANT OPTION`   | 把自己的权限授权给别人 | 给其他用户分配权限       |
| `ALL PRIVILEGES` | 所有权限               | 超级管理员               |

```
SHOW DATABASES;
SELECT DATABASE();
CREATE DATABASE  IF NOT EXISTS tice;
CREATE DATABASE zxy DEFAULT CHARSET utf8mb4;
DROP DATABASE IF EXISTS zxy;
USE duocai
SHOW TABLES;
DESC images;
SHOW CREATE TABLE users;
CREATE TABLE tb_user(
id INT COMMENT '编号',
NAME VARCHAR(50) COMMENT '姓名',
age INT COMMENT '年龄',
gender VARCHAR(1) COMMENT '性别'
)COMMENT '用户表';
SHOW CREATE TABLE tb_user;
CREATE TABLE emp(
id INT COMMENT '编号',
workno VARCHAR(10) COMMENT '工号',
NAME VARCHAR(10) COMMENT '姓名',
gender CHAR(1) COMMENT '性别',
age TINYINT UNSIGNED COMMENT '年龄',
idcard CHAR(18) COMMENT '身份证号码',
entrydate DATE COMMENT '入职时间'
)COMMENT '员工表';
DESC emp;
 ALTER TABLE emp ADD nickname VARCHAR(20)  COMMENT '昵称';
 ALTER TABLE emp ADD nickname VARCHAR(20)  COMMENT '昵称';
 ALTER TABLE emp MODIFY nickname VARCHAR(10);
 ALTER TABLE emp CHANGE nickname nicknamee VARCHAR(30);
 ALTER TABLE emp DROP nicknamee 
 ALTER TABLE emp RENAME TO empp;
 SHOW TABLES
 DROP TABLE IF EXISTS emp;
 DROP TABLE IF EXISTS empp;
 TRUNCATE TABLE emp
  INSERT INTO employee(id,workno,NAME,gender,age,idcard,entrydate) 
VALUES(1,'1','Itcast','男',10,'123456789012345678','2000-01-01')
DESC emp
 INSERT INTO emp(id,workno,NAME,gender,age,idcard,entrydate) VALUES(1,'1','ITcast','男',19,'123456789987654321','2004-10-01')
 SELECT * FROM employee;
 SELECT * FROM emp
 VALUES(2,'2','Itcast','男',-1,'123456789012345678','2000-01-01')
 INSERT INTO emp VALUES(2,'2','zxy','女',22,'987654321123456789','2000-07-07')
 INSERT INTO emp VALUES(3,'3','韦一笑','男',38,'123456789012345670','1987-01-01'),(4,'4','赵敏','女',18,'123456789012345670','2005-01-01');
 UPDATE emp SET NAME ='ithema' WHERE id=1;
 UPDATE emp SET NAME = '小昭' , gender = '女' WHERE id = 1;
 UPDATE employee SET entrydate = '2008-01-01';
 UPDATE emp SET entrydate='2008-01-01';
 DELETE FROM emp WHERE gender='男';
 DELETE FROM emp 
 DROP TABLE emp
 CREATE TABLE emp(
id INT COMMENT '编号',
workno VARCHAR(10) COMMENT '工号',
NAME VARCHAR(10) COMMENT'姓名',
age TINYINT UNSIGNED COMMENT'年龄',
 idcard CHAR(18) COMMENT '身份证号',
 workaddress VARCHAR(50) COMMENT '工作地址',
 entrydate DATE COMMENT '入职时间'
 )COMMENT '员工表';
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (1, '00001', '柳岩666', '女', 20, '123456789012345678', '北京', '2000-01-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (2, '00002', '张无忌', '男', 18, '123456789012345670', '北京', '2005-09-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (3, '00003', '韦一笑', '男', 38, '123456789712345670', '上海', '2005-08-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (4, '00004', '赵敏', '女', 18, '123456757123845670', '北京', '2009-12-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (5, '00005', '小昭', '女', 16, '123456769012345678', '上海', '2007-07-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (6, '00006', '杨逍', '男', 28, '12345678931234567X', '北京', '2006-01-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (7, '00007', '范瑶', '男', 40, '123456789212345670', '北京', '2005-05-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (8, '00008', '黛绮丝', '女', 38, '123456157123645670', '天津', '2015-05-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (9, '00009', '范凉凉', '女', 45, '123156789012345678', '北京', '2010-04-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (10, '00010', '陈友谅', '男', 53, '123456789012345670', '上海', '2011-01-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (11, '00011', '张士诚', '男', 55, '123567897123465670', '江苏', '2015-05-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (12, '00012', '常遇春', '男', 32, '123446757152345670', '北京', '2004-02-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (13, '00013', '张三丰', '男', 88, '123656789012345678', '江苏', '2020-11-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (14, '00014', '灭绝', '女', 65, '123456719012345670', '西安', '2019-05-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES (15, '00015', '胡青牛', '男', 70, '12345674971234567X', '西安', '2018-04-01');
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
 VALUES (16, '00016', '周芷若', '女', 18, NULL, '北京', '2012-06-01');
 
 INSERT INTO emp (id, workno, NAME, gender, age, idcard, workaddress, entrydate) 
VALUES 
(1, '00001', '柳岩666', '女', 20, '123456789012345678', '北京', '2000-01-01'),
(2, '00002', '张无忌', '男', 18, '123456789012345670', '北京', '2005-09-01'),
(3, '00003', '韦一笑', '男', 38, '123456789712345670', '上海', '2005-08-01'),
(4, '00004', '赵敏', '女', 18, '123456757123845670', '北京', '2009-12-01'),
(5, '00005', '小昭', '女', 16, '123456769012345678', '上海', '2007-07-01'),
(6, '00006', '杨逍', '男', 28, '12345678931234567X', '北京', '2006-01-01'),
(7, '00007', '范瑶', '男', 40, '123456789212345670', '北京', '2005-05-01'),
(8, '00008', '黛绮丝', '女', 38, '123456157123645670', '天津', '2015-05-01'),
(9, '00009', '范凉凉', '女', 45, '123156789012345678', '北京', '2010-04-01'),
(10, '00010', '陈友谅', '男', 53, '123456789012345670', '上海', '2011-01-01'),
(11, '00011', '张士诚', '男', 55, '123567897123465670', '江苏', '2015-05-01'),
(12, '00012', '常遇春', '男', 32, '123446757152345670', '北京', '2004-02-01'),
(13, '00013', '张三丰', '男', 88, '123656789012345678', '江苏', '2020-11-01'),
(14, '00014', '灭绝', '女', 65, '123456719012345670', '西安', '2019-05-01'),
(15, '00015', '胡青牛', '男', 70, '12345674971234567X', '西安', '2018-04-01'),
(16, '00016', '周芷若', '女', 18, NULL, '北京', '2012-06-01');
 gender CHAR(1) COMMENT '性别',
 
 ALTER TABLE emp ADD gender CHAR(1) COMMENT '性别'
 
 SELECT id FROM emp
 SELECT id,age FROM emp
 SELECT id AS 'id序号', age AS '年龄' FROM emp 
 
 USE duocai
 SELECT  DISTINCT  字段列表  FROM   表名;
 SELECT DISTINCT age,entrydate FROM emp
  
 SELECT DISTINCT workaddress AS '工作地址' FROM emp
 SELECT * FROM emp WHERE age=88;
 SELECT * FROM emp WHERE age<20;
 SELECT * FROM emp WHERE idcard IS NOT NULL 
 SELECT * FROM emp WHERE age<>88
 SELECT * FROM emp WHERE idcard LIKE'%X'
 SELECT * FROM emp WHERE NAME LIKE '__'
 SELECT * FROM emp WHERE age IN(18,20,40);
 SELECT * FROM emp WHERE age=18 OR age =20 OR age=40
 SELECT * FROM emp WHERE gender='女' AND age < 25
 SELECT * FROM emp WHERE age >= 15 && age <= 20;
 SELECT * FROM emp WHERE age >= 15 AND age <= 20;
 SELECT * FROM emp WHERE age BETWEEN 15 AND 20
 SELECT COUNT(idcard) FROM emp WHERE age<25
 SELECT COUNT(1) FROM emp 
 SELECT AVG(age) FROM emp WHERE age<40
SELECT SUM(age) FROM emp WHERE workaddress = '西安'
SELECT SUM(age) FROM emp WHERE workaddress= '西安'
SELECT gender,COUNT(*) 
FROM emp 
GROUP BY gender
HAVING COUNT(*) > 3;
SELECT gender,AVG(age) FROM emp GROUP BY gender
SELECT workaddress, COUNT(*) address_count FROM emp WHERE age < 45 GROUP BY  workaddress HAVING address_count >= 3; 
SELECT workaddress, COUNT(*) address_count FROM emp WHERE age < 45 GROUP BY  workaddress HAVING address_count >= 3;
DESC emp
SELECT workaddress, gender, COUNT(*) '数量' FROM emp GROUP BY gender , workaddress 
SELECT workaddress, gender, COUNT(*) '数量' FROM emp GROUP BY gender , workaddress
SELECT * FROM emp ORDER BY age, entrydate DESC
SELECT * FROM emp LIMIT 0,10
SELECT * FROM emp WHERE age IN(20,21,22,23,24,25,26,27,28,29,30)
SELECT * FROM emp WHERE gender = '男' AND ( age BETWEEN 20 AND 40 ) AND NAME LIKE  '___'; 
SELECT * FROM emp WHERE gender = '男' AND ( age BETWEEN 20 AND 40 ) AND NAME LIKE  '___';
SELECT gender, COUNT(*) FROM emp WHERE age < 60 GROUP BY gender; 
SELECT gender, COUNT(*) FROM emp WHERE age <60 GROUP BY gender
SELECT NAME , age FROM emp WHERE age <= 35 ORDER BY age ASC , entrydate DESC;
SELECT NAME , age FROM emp WHERE age <=35 ORDER BY age ASC ,entrydate DESC
SELECT * FROM emp WHERE gender = '男' AND age BETWEEN 20 AND 40 ORDER BY age ASC ,  entrydate ASC LIMIT 5 ;
SELECT * FROM emp WHERE gender = '男' AND age BETWEEN 20 AND 40 ORDER BY age ASC , entrydate ASC LIMIT 5; 
SELECT * FROM mysql.user;
SELECT * FROM mysql.user;


```

## 多表查询

**一对多**：多表加外键（日常 90% 都是它）

**多对多**：新建中间表

**一对一**：主键互关联，极少用

**一对多**  

案例: 部门 与 员工的关系 关系: 一个部门对应多个员工，一个员工对应一个部门 

实现: 在多的一方建立外键，指向一的一方的主键

![image-20260516062824737](C:\Users\DELL\Desktop\笔记\数据库\img\MySQL\一对多.png)

**多对多**

案例: 学生 与 课程的关系 关系: 一个学生可以选修多门课程，一门课程也可以供多个学生选择

 实现: 建立第三张中间表，中间表至少包含两个外键，分别关联两方主键

![image-20260516062902426](C:\Users\DELL\Desktop\笔记\数据库\img\MySQL\多对多.png)

SQL脚本

```
 create table student(
 id int auto_increment primary key comment '主键ID',
 name varchar(10) comment '姓名',
 no varchar(10) comment '学号'
 ) comment '学生表';
 insert into student values (null, '黛绮丝', '2000100101'),(null, '谢逊', 
'2000100102'),(null, '殷天正', '2000100103'),(null, '韦一笑', '2000100104');
 create table course(
 id int auto_increment primary key comment '主键ID',
 name varchar(10) comment '课程名称'
 ) comment '课程表';
 insert into course values (null, 'Java'), (null, 'PHP'), (null , 'MySQL') , 
(null, 'Hadoop');
 create table student_course(
 id int auto_increment comment '主键' primary key,
 studentid int not null comment '学生ID',
 courseid  int not null comment '课程ID',
 constraint fk_courseid foreign key (courseid) references course (id),
 constraint fk_studentid foreign key (studentid) references student (id)
 )comment '学生课程中间表';
 insert into student_course values (null,1,1),(null,1,2),(null,1,3),(null,2,2),
 (null,2,3),(null,3,4);
```

**一对一**

案例: 用户 与 用户详情的关系 关系: 一对一关系，多用于单表拆分，将一张表的基础字段放在一张表中，其他详情字段放在另 一张表中，以提升操作效率 

实现: 在任意一方加入外键，关联另外一方的主键，并且设置外键为唯一的(UNIQUE)

![image-20260516063006180](C:\Users\DELL\AppData\Roaming\Typora\typora-user-images\image-20260516063006180.png)

SQL脚本

```
 create table tb_user(
 id int auto_increment primary key comment '主键ID',
 name varchar(10) comment '姓名',
 age int comment '年龄',
 gender char(1) comment '1: 男 , 2: 女',
 phone char(11) comment '手机号'
 ) comment '用户基本信息表';
 create table tb_user_edu(
 id int auto_increment primary key comment '主键ID',
 degree varchar(20) comment '学历',
 major varchar(50) comment '专业',
 primaryschool varchar(50) comment '小学',
 middleschool varchar(50) comment '中学',
  university varchar(50) comment '大学',
 userid int unique comment '用户ID',
 constraint fk_userid foreign key (userid) references tb_user(id)
 ) comment '用户教育信息表';
 insert into tb_user(id, name, age, gender, phone) values
 (null,'黄渤',45,'1','18800001111'),
 (null,'冰冰',35,'2','18800002222'),
 (null,'码云',55,'1','18800008888'),
 (null,'李彦宏',50,'1','18800009999');
 insert into tb_user_edu(id, degree, major, primaryschool, middleschool, 
university, userid) values
 (null,'本科','舞蹈','静安区第一小学','静安区第一中学','北京舞蹈学院',1),
 (null,'硕士','表演','朝阳区第一小学','朝阳区第一中学','北京电影学院',2),
 (null,'本科','英语','杭州市第一小学','杭州市第一中学','杭州师范大学',3),
 (null,'本科','应用数学','阳泉第一小学','阳泉区第一中学','清华大学',4);
```



案例

```
  -- 创建dept表，并插入数据
CREATE TABLE dept(
 id   INT AUTO_INCREMENT COMMENT 'ID' PRIMARY KEY,
 NAME VARCHAR(50) NOT NULL COMMENT '部门名称'
 )COMMENT '部门表';
 INSERT INTO dept (id, NAME) VALUES (1, '研发部'), (2, '市场部'),(3, '财务部'), (4, '销售部'), (5, '总经办'), (6, '人事部');
  
  SELECT * FROM dept
  
  
  -- 创建emp表，并插入数据
CREATE TABLE emp(
id  INT AUTO_INCREMENT COMMENT 'ID' PRIMARY KEY,
NAME VARCHAR(50) NOT NULL COMMENT '姓名',
    age  INT COMMENT '年龄',
    job VARCHAR(20) COMMENT '职位',
    salary INT COMMENT '薪资',
    entrydate DATE COMMENT '入职时间',
    managerid INT COMMENT '直属领导ID',
    dept_id INT COMMENT '部门ID'
 )COMMENT '员工表';
  ALTER TABLE emp ADD CONSTRAINT fk_emp_dept_id FOREIGN KEY (dept_id) REFERENCES 
dept(id);
  INSERT INTO emp (id, NAME, age, job,salary, entrydate, managerid, dept_id) 
VALUES
            (1, '金庸', 66, '总裁',20000, '2000-01-01', NULL,5),
            (2, '张无忌', 20, '项目经理',12500, '2005-12-05', 1,1),
            (3, '杨逍', 33, '开发', 8400,'2000-11-03', 2,1),
            (4, '韦一笑', 48, '开发',11000, '2002-02-05', 2,1),
            (5, '常遇春', 43, '开发',10500, '2004-09-07', 3,1),
            (6, '小昭', 19, '程序员鼓励师',6600, '2004-10-12', 2,1),
            (7, '灭绝', 60, '财务总监',8500, '2002-09-12', 1,3),
            (8, '周芷若', 19, '会计',48000, '2006-06-02', 7,3),
            (9, '丁敏君', 23, '出纳',5250, '2009-05-13', 7,3),
            (10, '赵敏', 20, '市场部总监',12500, '2004-10-12', 1,2),
            (11, '鹿杖客', 56, '职员',3750, '2006-10-03', 10,2),
            (12, '鹤笔翁', 19, '职员',3750, '2007-05-09', 10,2),
            (13, '方东白', 19, '职员',5500, '2009-02-12', 10,2),
            (14, '张三丰', 88, '销售总监',14000, '2004-10-12', 1,4),
            (15, '俞莲舟', 38, '销售',4600, '2004-10-12', 14,4),
            (16, '宋远桥', 40, '销售',4600, '2004-10-12', 14,4),
            (17, '陈友谅', 42, NULL,2000, '2011-10-12', 1,NULL);
  
  SELECT * FROM emp
  
```

那么我们要执行多表查询，就只需要使用逗号分隔多张表即可，如： 

select * from emp , dept 

,我们看到查询结果中包含了大量的结果集，总共102条记录，而这其实就是员工表emp所有的记录 (17) 与 部门表dept所有记录(6) 的所有组合情况，这种现象称之为笛卡尔积

**笛卡尔积**: 笛卡尔乘积是指在数学中，两个集合A集合 和 B集合的所有组合情况。

![image-20260516064321460](C:\Users\DELL\Desktop\笔记\数据库\img\MySQL\笛卡尔积.png)

在SQL语句中，如何来去除无效的笛卡尔积呢？ 我们可以给多表查询加上连接查询的条件即可。

```
select * from emp , dept where emp.dept_id = dept.id;
```

而由于id为17的员工，没有dept_id字段值，所以在多表查询时，根据连接查询的条件并没有查询 到

**连接查询** 

内连接：相当于查询A、B交集部分数据 

外连接： 

左外连接：查询左表所有数据，以及两张表交集部分数据

 右外连接：查询右表所有数据，以及两张表交集部分数据 

自连接：当前表与自身的连接查询，自连接必须使用表别名

**子查询**

子查询就是 SQL 里嵌套另一条查询语句，先执行内层结果，再给外层使用。



内连接

![image-20260516064934090](C:\Users\DELL\Desktop\笔记\数据库\img\MySQL\内连接.png)

内连接的语法分为两种: 隐式内连接、显式内连接。先来学习一下具体的语法结构。

1.隐式内连接  不用 `JOIN`，**逗号分隔表，WHERE 写关联条件**

```
 SELECT  字段列表   FROM   表1 , 表2   WHERE   条件 ... ;
```

2.显示内连接  用 **INNER JOIN ... ON**

```
 SELECT  字段列表   FROM   表1  [ INNER ]  JOIN 表2  ON  连接条件 ... ;
```

案例:查询每一个员工的姓名 , 及关联的部门的名称 (隐式内连接实现)   

表结构: emp , dept   连接条件: emp.dept_id = dept.id

```
select emp.name , dept.name from emp , dept where emp.dept_id = dept.id ;
```

起别名 简化SQL

```
SELECT e.name,d.name FROM emp e, dept d WHERE e.dept_id = d.id
```

显式内连接实现

```
SELECT e.name, d.name FROM emp e INNER JOIN dept d ON e.dept_id = d.id
```

一旦为表起了别名，就不能再使用表名来指定对应的字段了，此时只能够使用别名来指定字 

段

外连接分为两种，分别是：左外连接 和 右外连接。具体的语法结构为：

左外连接相当于查询表1(左表)的所有数据，当然也包含表1和表2交集部分的数据。

```
SELECT  字段列表   FROM   表1  LEFT  [ OUTER ]  JOIN 表2  ON  条件 ... ;
```

右外连接相当于查询表2(右表)的所有数据，当然也包含表1和表2交集部分的数据。

```
 SELECT  字段列表   FROM   表1  RIGHT  [ OUTER ]  JOIN 表2  ON  条件 ... ;
```

案例:查询emp表的所有数据, 和对应的部门信息  

由于需求中提到，要查询emp的所有数据，所以是不能内连接查询的，需要考虑使用外连接查询。 

表结构: emp, dept 连接条件: emp.dept_id = dept.id

```
 select e.*, d.name from emp e left outer join dept d on e.dept_id = d.id;
```

案例: 查询dept表的所有数据, 和对应的员工信息(右外连接)

由于需求中提到，要查询dept表的所有数据，所以是不能内连接查询的，需要考虑使用外连接查 询。

 表结构: emp, dept 连接条件: emp.dept_id = dept.id

```
 select d.*, e.* from emp e right outer join dept d on e.dept_id = d.id;
 select d.*, e.* from dept d left outer join emp e on e.dept_id = d.id;
```

左外连接和右外连接是可以相互替换的，只需要调整在连接查询时SQL中，表结构的先后顺 序就可以了。而我们在日常开发使用时，更偏向于左外连接

自连接

自连接查询，顾名思义，就是自己连接自己，也就是把一张表连接查询多次。我们先来学习一下自连接 的查询语法

而对于自连接查询，可以是内连接查询，也可以是外连接查询

```
 SELECT  字段列表   FROM   表A   别名A   JOIN  表A    别名B   ON  条件 ... 
```

查出**员工姓名 + 直属领导姓名**

```
 select a.name , b.name from emp a , emp b where a.managerid = b.id;
```

```
 select a.name '员工', b.name '领导' from emp a left join emp b on a.managerid = 
b.id
```

第一句：**隐式内连接**，只查**有领导**的员工

第二句：**左外连接**，**所有员工都查出来**，没领导的领导名显示`null`

在自连接查询中，必须要为表起别名，要不然我们不清楚所指定的条件、返回的字段，到底 是哪一张表的字段

联合查询

- 对于union查询，就是把多次查询的结果合并起来，形成一个新的查询结果集。 
- 对于联合查询的多张表的列数必须保持一致，字段类型也需要保持一致。
- union all 会将全部的数据直接合并在一起，union 会对合并之后的数据去重。

```
 SELECT  字段列表   FROM   表A  ...  
UNION [ ALL ]
 SELECT  字段列表  FROM   表B  ....;
```

案例:将薪资低于 5000 的员工 , 和 年龄大于 50 岁的员工全部查询出来

过union/union all  一个去重 一个不去重

```
 SELECT * FROM emp WHERE salary <5000
 UNION ALL
 SELECT * FROM emp WHERE age >50
```



**子查询**

SQL语句中嵌套SELECT语句，称为嵌套查询，又称子查询。

 SELECT  *  FROM   t1   WHERE  column1 =  ( SELECT  column1  FROM  t2 );

子查询外部的语句可以是INSERT / UPDATE / DELETE / SELECT 的任何一个。

根据子查询结果不同，分为：

 A. 标量子查询（子查询结果为单个值）

 B. 列子查询(子查询结果为一列)

 C. 行子查询(子查询结果为一行)

 D. 表子查询(子查询结果为多行多列)

根据子查询位置，分为： 

A. WHERE之后 

B. FROM之后

 C. SELECT之后



| 类型       | 返回数据格式        | 常用运算符       | 使用场景               |
| ---------- | ------------------- | ---------------- | ---------------------- |
| 标量子查询 | 1 行 1 列（单个值） | `> < = >= <= !=` | 比较大小、匹配固定值   |
| 列子查询   | 多行 1 列（一组值） | `IN / ANY / ALL` | 匹配集合内任意数据     |
| 行子查询   | 1 行多列            | `=`              | 整行数据匹配（极少用） |
| 表子查询   | 多行多列（临时表）  | 无（起别名）     | 放 FROM 后当临时表查询 |

**标量子查询**

案例:  

A. 查询 "销售部" 的所有员工信息 完成这个需求时，我们可以将需求分解为两步： 

①. 查询 "销售部" 部门ID 

 select id from dept where name = '销售部';

 ②. 根据 "销售部" 部门ID, 查询员工信息 

```
select * from emp where dept_id = (select id from dept where name = '销售部');
```

 B. 查询在 "方东白" 入职之后的员工信息 完成这个需求时，我们可以将需求分解为两步： 

①. 查询 方东白 的入职日期

select entrydate from emp where name = '方东白';

 ②. 查询指定入职日期之后入职的员工信息

```
 select * from emp where entrydate > (select entrydate from emp where name = '方东
白');
```

**列子查询  子查询返回列表的所有值都必须满足**

常用的操作符：IN 、NOT IN 、 ANY 、SOME 、 ALL 

IN 匹配任一，NOT IN 全都不匹配，ANY/SOME 满足任意，ALL 全部都满足。

案例: 

 A. 查询 "销售部" 和 "市场部" 的所有员工信息 分解为以下两步:  

①. 查询 "销售部" 和 "市场部" 的部门ID

  select id from dept where name = '销售部' or name = '市场部';

 ②. 根据部门ID, 查询员工信息 

```
 select * from emp where dept_id in (select id from dept where name = '销售部' or  name = '市场部'); 
```

B. 查询比 财务部 所有人工资都高的员工信息 分解为以下两步: 

①. 查询所有 财务部 人员工资 

```
select id from dept where name = '财务部'; 
select salary from emp where dept_id = (select id from dept where name = '财务部'); 
```

②. 比 财务部 所有人工资都高的员工信息 

```
 select * from emp where salary > all ( select salary from emp where dept_id =  (select id from dept where name = '财务部') ); 
```

C. 查询比研发部其中任意一人工资高的员工信息 分解为以下两步: 

①. 查询研发部所有人工资 

 select salary from emp where dept_id = (select id from dept where name = '研发部'); 

②. 比研发部其中任意一人工资高的员工信息 

```
 select * from emp where salary > any ( select salary from emp where dept_id =  (select id from dept where name = '研发部') );
```

**行子查询  子查询返回的结果是一行（可以是多列），这种子查询称为行子查询。**

 常用的操作符：= 、<> 、IN 、NOT IN

案例:  

A. 查询与 "张无忌" 的薪资及直属领导相同的员工信息 ; 这个需求同样可以拆解为两步进行:

 ①. 查询 "张无忌" 的薪资及直属领导 select salary, managerid from emp where name = '张无忌'; 

 ②. 查询与 "张无忌" 的薪资及直属领导相同的员工信息 ; 

```
 select * from emp where (salary,managerid) = (select salary, managerid from emp  where name = '张无忌');
```

**表子查询  子查询返回的结果是多行多列，这种子查询称为表子查询** 

常用的操作符：IN 

案例: 

A. 查询与 "鹿杖客" , "宋远桥" 的职位和薪资相同的员工信息 分解为两步执行: 

①. 查询 "鹿杖客" , "宋远桥" 的职位和薪资 

select job, salary from emp where name = '鹿杖客' or name = '宋远桥';

 ②. 查询与 "鹿杖客" , "宋远桥" 的职位和薪资相同的员工信息 

```
 select * from emp where (job,salary) in ( select job, salary from emp where name =  '鹿杖客' or name = '宋远桥' ); 
```

B. 查询入职日期是 "2006-01-01" 之后的员工信息 , 及其部门信息 分解为两步执行:

 ①. 入职日期是 "2006-01-01" 之后的员工信息 

1 select * from emp where entrydate > '2006-01-01'; 

②. 查询这部分员工, 对应的部门信息; 

```
select e.*, d.* from (select * from emp where entrydate > '2006-01-01') e left  join dept d on e.dept_id = d.id ;
```

## 综合案例

```
create table salgrade(
    grade int,
    losal int,
    hisal int
 ) comment '薪资等级表';
 insert into salgrade values (1,0,3000);
 insert into salgrade values (2,3001,5000);
 insert into salgrade values (3,5001,8000);
 insert into salgrade values (4,8001,10000);
 insert into salgrade values (5,10001,15000);
 insert into salgrade values (6,15001,20000);
 insert into salgrade values (7,20001,25000);
 insert into salgrade values (8,25001,30000);
```

# 第二阶段：高阶必学（面试核心）

1. **窗口函数**：`row_number() rank() dense_rank()`
2. 索引原理、索引分类、联合索引、最左前缀
3. 索引失效场景（面试必背）
4. `EXPLAIN` 执行计划看懂
5. 事务 **ACID**、四大隔离级别
6. 脏读、不可重复读、幻读
7. 慢查询优化、SQL 优化技巧
8. 海量数据分页、深度分页解决方案
9. 数据库三大范式、表设计原则



## 函数

MySQL中的函数主要分为以下四类： 字符串函数、数值函数、日期函数、流程函数。

**字符串函数**

| 函数                     | 功能说明                 |
| ------------------------ | ------------------------ |
| CONCAT(s1,s2...)         | 拼接多个字符串           |
| LENGTH(str)              | 获取字符串字节长度       |
| CHAR_LENGTH(str)         | 获取字符串字符个数       |
| LEFT(str,n)              | 截取字符串左侧 n 个字符  |
| RIGHT(str,n)             | 截取字符串右侧 n 个字符  |
| SUBSTRING(str,start,len) | 从指定位置截取子串       |
| TRIM(str)                | 去除字符串首尾空格       |
| LTRIM(str)               | 去除左侧空格             |
| RTRIM(str)               | 去除右侧空格             |
| UPPER(str)               | 字符串转大写             |
| LOWER(str)               | 字符串转小写             |
| REPLACE(str,old,new)     | 字符串替换               |
| INSTR(str,sub)           | 返回子串第一次出现的位置 |

演示如下：

 A. concat : 字符串拼接

```
 select concat('Hello' , ' MySQL');
```

  B. lower : 全部转小写

```
select lower('Hello');
```

 C. upper : 全部转大写

```
select upper('Hello');
```

 D. lpad : 左填充 

```
select lpad('01', 5, '-'); 
```

E. rpad : 右填充 

```
select rpad('01', 5, '-'); 
```

F. trim : 去除空格

```
 select trim(' Hello  MySQL '); 
```

 G. substring : 截取子字符串

```
  select substring('Hello MySQL',1,5);
```

H.由于业务需求变更，企业员工的工号，统一为5位数，目前不足5位数的全部在前面补0。比如： 1号员 工的工号应该为00001。

```
 update emp set workno = lpad(workno, 5, '0');
```

数值函数

| 函数       | 功能说明                |
| ---------- | ----------------------- |
| ABS(x)     | 求绝对值                |
| CEIL(x)    | 向上取整                |
| FLOOR(x)   | 向下取整                |
| ROUND(x,n) | 四舍五入，保留 n 位小数 |
| MOD(m,n)   | 取余数（取模）          |
| RAND()     | 生成 0~1 随机小数       |
| PI()       | 返回圆周率              |
| POW(x,y)   | 计算 x 的 y 次方        |
| SQRT(x)    | 开平方根                |

A. ceil：向上取整 

select ceil(1.1);

B. floor：向下取整

1 select floor(1.9);

C. mod：取模  MOD (a, b) = a 除以 b 之后的余数

select mod(7,4); 

D. rand：获取随机数 

select rand(); 

E. round：四舍五入  

select round(2.344,2);

F.案例： 通过数据库的函数，生成一个六位数的随机验证码。 思路： 获取随机数可以通过rand()函数，但是获取出来的随机数是在0-1之间的，所以在其基础 上乘以1000000，然后舍弃小数部分，如果长度不足6位，补

```
SELECT LPAD(ROUND(RAND()*1000000 , 0), 6, '0')
```



日期函数

| 函数                            | 功能说明             |
| ------------------------------- | -------------------- |
| NOW()                           | 获取当前日期 + 时间  |
| CURDATE()                       | 获取当前日期         |
| CURTIME()                       | 获取当前时间         |
| YEAR(date)                      | 提取年份             |
| MONTH(date)                     | 提取月份             |
| DAY(date)                       | 提取日期天数         |
| HOUR(time)                      | 提取小时             |
| MINUTE(time)                    | 提取分钟             |
| SECOND(time)                    | 提取秒数             |
| DATE_ADD (date,INTERVAL n 单位) | 日期加指定时间       |
| DATE_SUB (date,INTERVAL n 单位) | 日期减指定时间       |
| DATEDIFF(d1,d2)                 | 计算两个日期相差天数 |
| DATE_FORMAT (date, 格式)        | 日期格式化           |



案例： 查询所有员工的入职天数，并根据入职天数倒序排序。 思路： 入职天数，就是通过当前日期 - 入职日期，所以需要使用datediff函数来完成。

 A. curdate：当前日期 

select curdate();

B. curtime：当前时间 

select curtime();

C. now：当前日期和时间 

select now(); 

D. YEAR , MONTH , DAY：当前年、月、日

select YEAR(now());

select MONTH(now());

select DAY(now())

 E. date_add：增加指定的时间间隔  

 select date_add(now(), INTERVAL 70 YEAR ); 

F. datediff：获取两个日期相差的天数 

select datediff('2021-10-01', '2021-12-01');

H. 查询所有员工的入职天数，并根据入职天数倒序排序。 思路： 入职天数，就是通过当前日期 - 入职日期，所以需要使用datediff函数来完成。

```
select name, datediff(curdate(), entrydate) as 'entrydays' from emp order by  entrydays desc;
```

流程控制函数

| 函数                                              | 功能说明                             |
| ------------------------------------------------- | ------------------------------------ |
| IF (条件，值 1, 值 2)                             | 条件成立返回值 1，否则返回值 2       |
| IFNULL(expr1,expr2)                               | expr1 不为空返回自身，为空返回 expr2 |
| NULLIF(expr1,expr2)                               | 两值相等返回 NULL，不等返回 expr1    |
| CASE 字段 WHEN 值 1 THEN 结果 1 ... ELSE 其他 END | 多条件分支判断，类似 switch          |

A.if

select if(false, 'Ok', 'Error');

B. ifnull 

select ifnull('Ok','Default'); 

select ifnull('','Default'); 

select ifnull(null,'Default');

C. case when then else end

 查询emp表的员工姓名和工作地址 (北京/上海 ----> 一线城市 , 其他 ----> 二线城市) 

```
select
    name,
    ( case workaddress when '北京' then '一线城市' when '上海' then '一线城市' else 
'二线城市' end ) as '工作地址'
 from emp;
```

D.

```
 create table score(
    id int comment 'ID',
    name varchar(20) comment '姓名',
    math int comment '数学',
    english int comment '英语',
    chinese int comment '语文'
 ) comment '学员成绩表';
 insert into score(id, name, math, english, chinese) VALUES (1, 'Tom', 67, 88, 95 
), (2, 'Rose' , 23, 66, 90),(3, 'Jack', 56, 98, 76);
```

```
 SELECT
 id,
 NAME,
 (CASE WHEN math >= 85 THEN '优秀' WHEN math >=60 THEN '及格' ELSE '不及格' END ) '数学',
 (CASE WHEN english >= 85 THEN '优秀' WHEN english >=60 THEN '及格' ELSE '不及格' END ) '英语',
(CASE WHEN chinese >= 85 THEN '优秀' WHEN chinese >=60 THEN '及格' ELSE '不及格'  END ) '语文'
FROM score
```

MySQL 自定义函数 超精简完整版

一、必备规则

1. 必须**有返回值**
2. 只能传**IN 输入参数**，无 out
3. 调用：`SELECT 函数名()`
4. 必须改结束符 `DELIMITER`

## 约束

**约束就是给表字段加规则**，用来**限制表中数据**，保证数据**完整性、正确性、合法性**，防止插入错误、重复、空值数据。

| 约束名     | 关键字        | 作用                         |
| ---------- | ------------- | ---------------------------- |
| 主键约束   | `PRIMARY KEY` | 唯一且非空，表唯一标识       |
| 唯一约束   | `UNIQUE`      | 值不能重复，允许为空         |
| 非空约束   | `NOT NULL`    | 字段**不能为空**             |
| 默认值约束 | `DEFAULT`     | 不填数据自动用默认值         |
| 外键约束   | `FOREIGN KEY` | 两张表建立关联，保证数据一致 |

约束是作用于表中字段上的，可以在创建表/修改表的时候添加约束。

```
CREATE TABLE tb_user(
    id int AUTO_INCREMENT PRIMARY KEY  COMMENT  'ID唯一标识',
    name varchar(10) NOT NULL UNIQUE  COMMENT  '姓名' ,
    age int check (age > 0 && age <= 120)  COMMENT  '年龄' ,
    status char(1) default  '1'  COMMENT  '状态',
    gender char(1)  COMMENT  '性别'
 );
```

验证约束

```
insert into tb_user(name,age,status,gender) values ('Tom1',19,'1','男'),
 ('Tom2',25,'0','男');
 insert into tb_user(name,age,status,gender) values ('Tom3',19,'1','男');
 insert into tb_user(name,age,status,gender) values (null,19,'1','男');
 insert into tb_user(name,age,status,gender) values ('Tom3',19,'1','男');
 insert into tb_user(name,age,status,gender) values ('Tom4',80,'1','男');
 insert into tb_user(name,age,status,gender) values ('Tom5',-1,'1','男');
 insert into tb_user(name,age,status,gender) values ('Tom5',121,'1','男');
 insert into tb_user(name,age,gender) values ('Tom5',120,'男');
```

**外键约束**

![image-20260515070426627](C:\Users\DELL\Desktop\笔记\数据库\img\MySQL\外键.png)

左侧的emp表是员工表，里面存储员工的基本信息，包含员工的ID、姓名、年龄、职位、薪资、入职日 期、上级主管ID、部门ID，在员工的信息中存储的是部门的ID dept_id，而这个部门的ID是关联的 部门表dept的主键id，那emp表的dept_id就是外键,关联的是另一张表的主键。

 注意：目前上述两张表，只是在逻辑上存在这样一层关系；在数据库层面，并未建立外键关联， 所以是无法保证数据的一致性和完整性的。

创建外键

```
ALTER   TABLE  表名   ADD  CONSTRAINT   外键名称   FOREIGN   KEY (外键字段名)  
REFERENCES  主表 (主表列名) ;
```

```
alter table emp add constraint fk_emp_dept_id foreign key (dept_id) references 
dept(id);
```

删除外键

```
ALTER   TABLE  表名   DROP  FOREIGN  KEY  外键名称;
```

```
 alter table emp drop foreign key fk_emp_dept_id;
```

## 事务

**事务是一组 SQL 语句组成的逻辑执行单元**，这组 SQL**要么全部执行成功，要么全部执行失败回滚**，保证数据操作安全可靠。

**回滚事务：**就需要通过数据的事务来完成，我们只需要在业务逻辑执行之前开启事务，执行 完毕后提交事务。如果执行过程中报错，则回滚事务，把数据恢复到事务开始之前的状态。

**事务四大特性 ACID**

1. 原子性（Atomicity）不可分割，全部成功 或 全部失败回滚。
2. 一致性（Consistency）事务执行前后，数据整体状态保持合法一致。
3. 隔离性（Isolation）多个事务互不干扰，互相隔离。
4. 持久性（Durability）事务提交后，数据永久保存，断电不丢失。

**并发事务**

 **赃读：**一个事务读到另外一个事务还没有提交的数据。

![image-20260515074859989](C:\Users\DELL\Desktop\笔记\数据库\img\MySQL\脏读.png)

比如B读取到了A未提交的数据。



**不可重复读：**一个事务先后读取同一条记录，但两次读取的数据不同，称之为不可重复读。

![image-20260515074931574](C:\Users\DELL\Desktop\笔记\数据库\img\MySQL\不可重复读.png)

事务A两次读取同一条记录，但是读取到的数据却是不一样的



**幻读：**一个事务按照条件查询数据时，没有对应的数据行，但是在插入数据时，又发现这行数据 已经存在，好像出现了 "幻影"。

![image-20260515075112112](C:\Users\DELL\Desktop\笔记\数据库\img\MySQL\幻读.png)

**更新丢失**：两个事务同时修改同一数据，后执行的覆盖先执行的，数据丢失

默认MySQL的事务是自动提交的，也就是说，当执行完一条DML语句时，MySQL会立即隐 式的提交事务。

| 操作         | 正确完整 SQL          | 作用                         |
| ------------ | --------------------- | ---------------------------- |
| 标准开启事务 | `START TRANSACTION;`  | 开启事务，最安全             |
| 简写开启事务 | `BEGIN;`              | 快速开启事务                 |
| 关闭自动提交 | `SET autocommit = 0;` | 手动控制事务                 |
| 打开自动提交 | `SET autocommit = 1;` | 恢复默认（执行一句生效一句） |
| 提交事务     | `COMMIT;`             | 保存所有修改                 |
| 回滚事务     | `ROLLBACK;`           | 撤销所有修改                 |

```
-- 1. 查询张三余额
select * from account where name = '张三';
-- 2. 张三的余额减少1000
 update account set money = money - 1000 where name = '张三';
 -- 3. 李四的余额增加1000
 update account set money = money + 1000 where name = '李四';
```

一步一步的执行

```
-- 1. 查询张三余额
select * from account where name = '张三';
-- 2. 张三的余额减少1000
 update account set money = money - 1000 where name = '张三';
出错了....
-- 3. 李四的余额增加1000
 update account set money = money + 1000 where name = '李四';
```

2 -3一起执行

 控制事务一  查看/设置事务提交方式 

 SELECT  @@autocommit ; SET 

  @@autocommit = 0 ; 

. 提交事务 1 COMMIT; 

回滚事务 1 ROLLBACK;

注意：上述的这种方式，我们是修改了事务的自动提交行为, 把默认的自动提交修改为了手动提 交, 此时我们执行的DML语句都不会提交, 需要手动的执行commit进行提交。

 控制事务二 

 开启事务  START  TRANSACTION   或  BEGIN ; 

 提交事务  COMMIT; 

 回滚事务 ROLLBACK;

综合案例

```
-- 开启事务
start transaction -- 1. 查询张三余额
select * from account where name = '张三';-- 2. 张三的余额减少1000
 update account set money = money - 1000 where name = '张三';-- 3. 李四的余额增加1000
 update account set money = money + 1000 where name = '李四';-- 如果正常执行完毕, 则提交事务
commit;-- 如果执行过程中报错, 则回滚事务-- rollback
```



| 隔离级别                                 | 语法设置                                                    | 解决问题                                     |
| ---------------------------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| 1. 读未提交READ UNCOMMITTED              | `SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;` | 啥都不解决，问题全存在                       |
| 2. 读已提交READ COMMITTED                | `SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;`   | 解决：**脏读**剩余：不可重复读、幻读         |
| 3. 可重复读REPEATABLE READ（MySQL 默认） | `SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;`  | 解决：脏读、不可重复读剩余：**幻读**         |
| 4. 串行化SERIALIZABLE                    | `SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;`     | 全部解决（脏读、不可重复读、幻读），性能最差 |

查看事务隔离级别

  SELECT @@TRANSACTION_ISOLATION;

注意：事务隔离级别越高，数据越安全，但是性能越低

## 存储引擎

![fTn58ND7i](C:\Users\DELL\Desktop\笔记\数据库\img\MySQL\体系结构.jpeg)

| 层级                  | 组成模块                           | 核心作用                                 |
| --------------------- | ---------------------------------- | ---------------------------------------- |
| **1. 连接层**         | 连接池、认证、权限校验             | 负责客户端连接、账号密码验证、分配线程   |
| **2. 服务层（核心）** | SQL 接口、解析器、优化器、查询缓存 | 接收 SQL、语法解析、语义分析、执行优化   |
| **3. 引擎层**         | InnoDB、MyISAM、Memory 等          | 真正执行增删改查，负责事务、锁、读写数据 |
| **4. 存储层**         | 磁盘文件、日志、数据文件           | 永久存放数据、日志、索引、配置文件       |

SQL执行过程

**客户端 → 连接层校验 → 服务层解析优化 → 存储引擎执行 → 磁盘存取数据 → 返回结果**

**存储引擎对比**

| 对比项       | InnoDB                               | MyISAM                           | Memory                     |
| ------------ | ------------------------------------ | -------------------------------- | -------------------------- |
| **事务支持** | ✅ 支持事务、ACID                     | ❌ 不支持事务                     | ❌ 不支持                   |
| **锁机制**   | **行级锁 + 表锁**，并发高            | **全表锁**，并发差               | 表级锁                     |
| **外键约束** | ✅ 支持                               | ❌ 不支持                         | ❌ 不支持                   |
| **崩溃恢复** | ✅ 有 redo/undo 日志，安全恢复        | ❌ 无日志，宕机易丢数据           | ❌ 断电全丢                 |
| **索引结构** | 聚簇索引                             | 非聚簇索引                       | 哈希索引                   |
| **读写性能** | 读写均衡，写快                       | **查询极快，写入慢**             | 速度最快                   |
| **数据存放** | 磁盘持久化                           | 磁盘持久化                       | **纯内存存储**             |
| **全文索引** | 5.6 版本后支持                       | 原生支持                         | 不支持                     |
| **主键**     | 必须有主键                           | 可无主键                         | 可无主键                   |
| **适用场景** | 电商、转账、订单、金融、**业务主流** | 静态数据、博客、文章、纯查询业务 | 临时数据、热点缓存、临时表 |
| **默认引擎** | MySQL5.5 + 默认                      | 5.5 之前默认                     | 临时业务使用               |

SHOW ENGINES; 查询支持的存储引擎



```
核心优缺点（背诵版）
1.InnoDB
优点
支持事务，满足数据一致性
行锁，高并发写入友好
支持外键、事务回滚
宕机可通过日志恢复数据
缺点
相比 MyISAM 查询速度略慢
占用磁盘空间更大
2.MyISAM
优点
结构简单，查询速度极快
占用资源少
缺点
不支持事务，不能回滚
只有表锁，多用户写入极易阻塞
安全性差，断电易损坏数据
3.Memory
优点
全部数据放内存，读写速度最快
缺点
数据不落地，重启数据库数据全部清空
不适合存正式业务数据
```

## 索引

**一、索引是数据库中一种有序的数据结构**，用来快速定位表中数据，相当于数据表的**目录**，能大幅提升查询效率。

在数据之外，数据库系统还维护着满足 特定查找算法的数据结构，这些数据结构以某种方式引用（指向）数据， 这样就可以在这些数据结构 上实现高级查找算法，这种数据结构就是索引

**二、作用**

1. 加快数据查询速度
2. 减少磁盘 IO 扫描次数
3. 唯一索引可约束数据唯一性

**三、本质**

以**空间换时间**，占用额外磁盘空间，换取查询提速。

MySQL的索引是在存储引擎层实现的，不同的存储引擎有不同的索引结构，主要包含以下几种：

| 存储引擎 | 主流索引结构   | 索引类型特点                                                 |
| -------- | -------------- | ------------------------------------------------------------ |
| InnoDB   | **B + 树索引** | 聚簇索引为主，支持主键索引、二级索引、联合索引，支持事务、行锁，最常用 |
| MyISAM   | **B + 树索引** | 非聚簇索引，索引与数据文件分离，查询快，不支持事务           |
| Memory   | **哈希索引**   | 默认哈希索引，等值查询极快，**不支持范围查询、排序**         |

| 索引结构   | 适用引擎       | 核心描述                                               | 优点                                           | 缺点                                       | 适用场景                   |
| ---------- | -------------- | ------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------ | -------------------------- |
| B + 树索引 | InnoDB、MyISAM | 多路平衡查找树，数据全存叶子节点，叶子节点有序链表相连 | 范围查询、排序、分页、模糊匹配都强，磁盘 IO 少 | 等值查询略慢于哈希                         | 日常绝大多数业务查询       |
| 哈希索引   | Memory         | 基于哈希算法，键值映射存储，无有序排序                 | 等值查询速度极快                               | 不支持范围查询、排序、联合索引，易哈希冲突 | 精准等值匹配查询           |
| 全文索引   | InnoDB、MyISAM | 专门针对大文本分词检索                                 | 快速匹配文章、内容关键字                       | 占用空间大，只适合文本检索                 | 文章、资讯、长文本内容搜索 |
| 空间索引   | InnoDB         | 针对地理位置坐标建立索引                               | 高效查询区域、距离范围数据                     | 通用性差                                   | 地理位置、经纬度范围查询   |

在MySQL数据库，将索引的具体类型主要分为以下几类：主键索引、唯一索引、常规索引、全文索引。

| 索引类型 | 关键字      | 特点                              | 约束规则                           | 使用场景                     |
| -------- | ----------- | --------------------------------- | ---------------------------------- | ---------------------------- |
| 主键索引 | PRIMARY KEY | 优先级最高，InnoDB 必选，聚簇索引 | 唯一且不能为空，一张表**只能一个** | 主键字段、唯一标识数据       |
| 唯一索引 | UNIQUE      | 值唯一不重复，允许为空            | 字段数据不能重复，可存多个 null    | 手机号、身份证号、邮箱       |
| 常规索引 | INDEX       | 最基础普通索引，无约束            | 允许重复、允许为空，无限制         | 普通字段加快查询速度         |
| 全文索引 | FULLTEXT    | 针对大文本分词检索                | 支持长文本模糊搜索，不适用短句     | 文章内容、简介、大段文字检索 |

**索引语法**

创建索引

```
 CREATE  [ UNIQUE | FULLTEXT ]  INDEX  index_name  ON  table_name  ( 
index_col_name,... ) ;
```

查看索引

```
SHOW  INDEX  FROM  table_name ;
```

删除索引

```
 DROP  INDEX  index_name  ON  table_name ;
```

案例

```
 CREATE INDEX idx_user_name ON tb_user(name);
```



```
 CREATE UNIQUE INDEX idx_user_phone ON tb_user(phone);
```



```
CREATE INDEX idx_user_pro_age_sta ON tb_user(profession,age,status);
```

没有索引：全表逐行遍历找数据

建立索引：翻目录直接定位数据

## 视图

- 视图（View）是一种虚拟存在的表。
- 视图中的数据并不在数据库中实际存在，行和列数据来自定义视 图的查询中使用的表，并且是在使用视图时动态生成的。
- 通俗的讲，视图只保存了查询的SQL逻辑，不保存查询结果。所以我们在创建视图的时候，主要的工作 就落在创建这条SQL查询语句上。
- 视图是虚拟表，存查询语句不存数据，查视图即执行对应 SQL。

1.创建

```
 CREATE   [OR REPLACE]   VIEW  视图名称[(列名列表)]   AS   SELECT语句   [ WITH [ 
CASCADED  |  LOCAL ]  CHECK  OPTION ]
```

2.查询

```
查看创建视图语句：SHOW  CREATE  VIEW  视图名称;
查看视图数据：SELECT  *  FROM   视图名称 ...... ;
```

3.修改

```
方式一：CREATE   [OR REPLACE]   VIEW  视图名称[(列名列表)]   AS   SELECT语句   [ WITH 
[ CASCADED  |  LOCAL ]  CHECK  OPTION ]
方式二：ALTER   VIEW  视图名称[(列名列表)]   AS   SELECT语句   [ WITH [ CASCADED  |  
LOCAL ]  CHECK  OPTION ]
```

4.删除

```
DROP  VIEW  [IF EXISTS]   视图名称   [,视图名称]  ...
```

案例 

```
-- 创建视图
create or replace view stu_v_1 as select id,name from student where id <= 10;-- 查询视图
show create view stu_v_1;
 select * from stu_v_1;
 select * from stu_v_1 where id < 3;-- 修改视图
create or replace view stu_v_1 as select id,name,no from student where id <= 10;
 alter view stu_v_1 as select id,name from student where id <= 10;-- 删除视图
drop view if exists stu_v_1;
```

如果我们定义视图时，如果指定了条件，然后我们在插入、修改、删除数据时，是否可以做到必须满足 条件才能操作，否则不能够操作呢？ 答案是可以的，这就需要借助于视图的检查选项

## 存储

**存储:**存储过程是事先经过编译并存储在数据库中的一段 SQL 语句的集合，调用存储过程可以简化应用开发 人员的很多工作，减少数据在数据库和应用服务器之间的传输，对于提高数据处理的效率是有好处的。

 存储过程思想上很简单，就是数据库 SQL 语言层面的代码封装与重用。

**特点:**

- 封装，复用 -----------------------> 可以把某一业务SQL封装在存储过程中，需要用到 的时候直接调用即可。 
- 可以接收参数，也可以返回数据 --------> 再存储过程中，可以传递参数，也可以接收返回 值。 
- 减少网络交互，效率提升 -------------> 如果涉及到多条SQL，每执行一次都是一次网络传 输。 而如果封装在存储过程中，我们只需要网络交互一次可能就可以了。

语句

```
1). 创建
 CREATE  PROCEDURE   存储过程名称 ([ 参数列表 ])
 BEGIN-- SQL语句
END ;
 2). 调用
 CALL  名称  ([ 参数 ]); 
3). 查看
 SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = 'xxx';  -- 查询指
定数据库的存储过程及状态信息
SHOW  CREATE  PROCEDURE   存储过程名称 ;  -- 查询某个存储过程的定义
4). 删除
 DROP  PROCEDURE   [ IF EXISTS ]  存储过程名称 ；
注意: 
在命令行中，执行创建存储过程的SQL时，需要通过关键字 delimiter 指定SQL语句的
结束符
```

实例

```
-- 存储过程基本语法-- 创建
create procedure p1()
 begin
    select count(*) from student;
 end;-- 调用
call p1();-- 查看
select * from information_schema.ROUTINES where ROUTINE_SCHEMA = 'itcast';
 show create procedure p1;-- 删除
drop procedure if exists p1;
```

### 变量

### if

### 参数

### case

### while

###  repeat

### loop

### Handler

### 存储函数

## 触发器

**定义:** 触发器是与表有关的数据库对象，指在insert/update/delete之前(BEFORE)或之后(AFTER)，触 发并执行触发器中定义的SQL语句集合。触发器的这种特性可以协助应用在数据库端确保数据的完整性  , 日志记录 , 数据校验等操作

使用别名OLD和NEW来引用触发器中发生变化的记录内容，这与其他的数据库是相似的。现在触发器还 只支持行级触发，不支持语句级触发

**类型**

| 类型                   | 分类             | 说明                                         | 使用场景                           |
| ---------------------- | ---------------- | -------------------------------------------- | ---------------------------------- |
| BEFORE                 | **按执行时机**   | 操作**执行前**触发                           | 数据校验、修改前置值、拦截非法数据 |
| AFTER                  |                  | 操作**执行后**触发                           | 数据同步、日志记录、级联操作       |
| INSERT                 | **按触发事件**   | 新增数据时触发                               | 新增后同步附属表、初始化关联数据   |
| UPDATE                 |                  | 修改数据时触发                               | 更新前后数据对比、变更记录留存     |
| DELETE                 |                  | 删除数据时触发                               | 删除归档、级联清理关联数据         |
| 行级触发器FOR EACH ROW | **按触发粒度**   | **每一行数据**变动都触发（MySQL 仅支持这种） | 绝大多数业务场景，精准联动数据     |
| NEW                    | **新旧数据标识** | 代表**新数据**，INSERT/UPDATE 可用           | 获取插入值、修改后新值             |
| OLD                    |                  | 代表**旧数据**，UPDATE/DELETE 可用           | 获取原值、删除前数据               |



## 日志

该日志是默认开启的，默认存放目录/var/log/，默认的日志文件名为 mysqld.log 

二进制日志（BINLOG）记录了所有的 DDL（数据定义语言）语句和 DML（数据操纵语言）语句，但 不包括数据查询（SELECT、SHOW）语句。

 作用：①. 灾难时的数据恢复；

②. MySQL的主从复制。

在MySQL8版本中，默认二进制日志是开启着 的，涉及到的参数如下：

 1 show variables like '%log_bin%'

2 log_bin_basename：当前数据库服务器的binlog日志的基础名称(前缀)，具体的binlog文 件名需要再该basename的基础上加上编号(编号从000001开始)。

 3log_bin_index：binlog的索引文件，里面记录了当前服务器关联的binlog文件有哪些

| 日志格式 | 英文名称      | 特点                                                         | 优缺点                                                       | 适用场景                         |
| -------- | ------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------- |
| 行格式   | **ROW**       | 记录**每一行**数据修改前后内容                               | 优点：数据精准、无歧义、安全缺点：日志体积大、占用空间多     | 主从复制、数据恢复、生产环境首选 |
| 语句格式 | **STATEMENT** | 记录**执行的 SQL 语句**                                      | 优点：日志体积小、速度快缺点：函数、随机数、时间函数易造成主从数据不一致 | 简单静态 SQL、低并发老项目       |
| 混合格式 | **MIXED**     | 默认格式，**自动切换**普通 SQL 用 STATEMENT，特殊 SQL 用 ROW | 兼顾体积与数据一致性，均衡最优                               | MySQL 默认格式，日常开发通用     |

由于日志是以二进制方式存储的，不能直接读取，需要通过二进制日志查询工具 mysqlbinlog 来查 看

```
mysqlbinlog  [ 参数选项 ]  logfilename
参数选项：
    -d      指定数据库名称，只列出指定的数据库相关操作。
    -o      忽略掉日志中的前n行命令。
    -v      将行事件(数据变更)重构为SQL语句
    -vv     将行事件(数据变更)重构为SQL语句，并输出注释信息
```

| 操作作用             | SQL 指令                                          | 说明                                             |
| -------------------- | ------------------------------------------------- | ------------------------------------------------ |
| 删除所有 binlog 日志 | `RESET MASTER;`                                   | 清空全部二进制日志，重新从 000001 开始，**慎用** |
| 删除指定序号前日志   | `PURGE MASTER LOGS TO 'mysql-bin.000005';`        | 删除 000005 之前所有日志，保留当前及后续         |
| 删除指定时间前日志   | `PURGE MASTER LOGS BEFORE '2026-05-15 10:00:00';` | 删除该时间点之前所有 binlog 日志                 |
| 自动过期清理         | 修改配置 `expire_logs_days=7`                     | 自动删除 7 天前日志，无需手动删                  |
| 清空错误日志         | `truncate table mysql.error_log;`                 | 清空数据库内错误日志记录                         |
| 清空慢查询日志       | 关闭慢查询重启 / 直接清空日志文件                 | 多用于测试环境清理                               |

如果需要开启查询日志，可以修改MySQL的配置文件 /etc/my.cnf 文件，添加如下内容：

```
#该选项用来开启查询日志 ， 可选值 ： 0 或者 1 ； 0 代表关闭， 1 代表开启 
general_log=1
 #设置日志的文件名 ， 如果没有指定， 默认的文件名为 host_name.log 
general_log_file=mysql_query.log
```

 开启了查询日志之后，在MySQL的数据存放目录，也就是 /var/lib/mysql/ 目录下就会出现  mysql_query.log 文件。之后所有的客户端的增删改查操作都会记录在该日志文件之中，长时间运 行后，该日志文件将会非常大。

如果需要开启慢查询日志，需要在MySQL的配置文件 /etc/my.cnf 中配置如下参数：

```
#慢查询日志
slow_query_log=1
 #执行时间参数
long_query_time=2

 #记录执行较慢的管理语句
log_slow_admin_statements =1
 #记录执行较慢的未使用索引的语句
log_queries_not_using_indexes = 1
```

# 第三阶段: 进阶

## 存储引擎

## SQL优化

## 锁

## 双主三从

# 第四阶段: 综合练习

### 练习表结构（直接建表就能练）

三张经典表：

1. **员工表 emp**：id,name,job,salary,dept_id,hire_date
2. **部门表 dept**：dept_id,dept_name,location
3. **工资等级表 sal_level**：level,min_sal,max_sal

### 基础练习题

1. 查询所有员工姓名、工资
2. 查询工资大于 8000 的员工
3. 查询岗位是程序员且工资在 7000~12000 之间的员工
4. 查询姓名包含「张」的员工
5. 按工资降序排序，取前 5 名

### 分组统计题

1. 统计每个部门人数、平均工资、最高工资、最低工资
2. 统计各岗位人数，只显示人数大于 2 的岗位
3. 统计每年入职员工数量

### 多表联查（面试高频手写）

1. 查询员工姓名、工资、所属部门名称
2. 查询所有部门及对应员工（无员工也要显示部门）
3. 查询平均工资最高的部门名称
4. 查询工资高于所在部门平均工资的员工

### 子查询 + 窗口函数进阶

1. 查询工资最高的员工信息
2. 查询每个部门工资前三的员工（**row_number 经典题**）
3. 实现分页：第 3 页，每页 10 条
4. 用窗口函数做部门内工资排名



emp 员工表、dept 部门表、salary 工资表

### 基础题

1. 查询所有员工信息
2. 查询工资大于 6000 的员工
3. 查询姓名带 “王” 的员工
4. 查询年龄 20~30 岁之间的员工
5. 按工资降序排序，取前 5 人

### 分组统计题

1. 统计每个部门人数、平均工资、最高工资
2. 统计各岗位人数，只显示人数大于 3 的岗位
3. 统计每年入职员工数量

### 多表联查（面试手写）

1. 查询员工姓名、工资、所属部门名称
2. 查询所有部门，包含没有员工的部门
3. 查询平均工资最高的部门
4. 查询工资高于本部门平均工资的员工

### 窗口函数进阶题

1. 每个部门内部按工资排名
2. 取出每个部门工资前 3 名员工

### 分页与优化题

1. 实现分页：第 3 页，每页 10 条
2. 写出一条会导致索引失效的 SQL 并说明原因

# 第五阶段: 面试真题

## 1. 事务四大特性 ACID

- **A 原子性**：要么全成功，要么全回滚
- **C 一致性**：事务前后数据状态合法一致
- **I 隔离性**：事务之间互不干扰
- **D 持久性**：提交后数据永久保存

## 2. 事务四大隔离级别（默认可重复读）

1. 读未提交：脏读、不可重复读、幻读都有
2. 读已提交：解决脏读，**Oracle 默认**
3. 可重复读：解决脏读 + 不可重复读，**MySQL 默认**
4. 串行化：最高级别，全部解决，性能最差

## 3. 脏读、不可重复读、幻读

- **脏读**：读到别人未提交脏数据
- **不可重复读**：同一事务两次查同一条数据不一样
- **幻读**：同一事务两次查询，条数不一样（新增 / 删除）

## 4. MySQL 如何解决幻读

- 快照读：**MVCC 多版本并发控制**
- 当前读：**间隙锁 + 临键锁** 锁住区间防止插入

## 5. InnoDB 三大日志

- **redo log**：崩溃恢复，保证事务持久性
- **undo log**：事务回滚、MVCC 版本链
- **binlog**：归档日志，主从同步、数据恢复

## 6. MVCC 原理

多版本并发控制，**无锁实现读写并发**

- 依赖：undo log + read view
- 每行数据存**事务 ID、删除标记**
- 普通 SELECT 走快照读，不加锁

## 7. 索引分类

- 主键索引、唯一索引、普通索引、联合索引、全文索引
- 聚簇索引、二级（辅助）索引

## 8. 聚簇索引与非聚簇索引区别

- **聚簇**：叶子存**整行数据**，一张表只有一个
- **非聚簇**：叶子存**主键值**，回表查询

## 9. 联合索引最左匹配原则

查询必须**从最左列开始**，跳过中间列失效

例：索引 (a,b,c) 查 b、c 不走索引

## 10. 索引失效常见场景

- 左右模糊查询 `%xx`、`%xx%`
- 字段隐式类型转换
- or 无全索引、not in、not exists
- order by 字段无索引
- 联合索引不满足最左

## 11. 为什么用 B + 树不用 B 树、哈希

- B + 树**非叶子不存数据**，层高更低，磁盘 IO 少
- 叶子有序链表，**范围查询极强**
- 哈希不支持排序、范围、模糊查询

## 12. InnoDB 索引层高一般几层

千万级数据**3 层**足够，查询极快

## 13. 回表查询是什么

二级索引查到**主键**，再去聚簇索引拿整行数据

## 14. 覆盖索引

查询字段**全部在索引里**，无需回表，性能极高

## 15. 主键设计原则

- 自增主键最优，**有序插入**减少页分裂
- 禁用 UUID、无序字符串当主键

## 16. 锁分类

- 行锁：InnoDB 默认，粒度小并发高
- 表锁：MyISAM，粒度大并发低
- 意向锁、临键锁、间隙锁、记录锁

## 17. MyISAM 和 InnoDB 区别

- InnoDB：支持事务、行锁、外键、MVCC，**默认引擎**
- MyISAM：无事务、表锁、快，不支持崩溃安全

## 18. 慢查询优化步骤

1. 开启慢查询日志定位慢 SQL
2. explain 分析执行计划
3. 加合适索引、优化 limit、分页优化
4. 大表分库分表、读写分离

## 19. limit 百万分页优化

- 主键分页：`where id>1000000 limit 10`
- 延迟关联、子查询优化

## 20. 主从复制原理

1. 主库写入记录**binlog**
2. 从库 IO 线程拉取 binlog
3. SQL 线程重放日志实现数据同步