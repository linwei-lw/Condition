/**
 * 系统某些功能隐藏模块
 */
let H = {map:{}};

H.init = ({hides}) => {
  if (!hides) return;
  for (let array = hides.split(','),i=0,len=array.length; i<len; i++) {
    H.map[array[i]] = true;
  }
};

H.show = key => {
  return !(H.map[key] || false);
};

export default window.$_H = H;

/**
登录页面
	login0:个人账户
  login1:app下载
  
菜单栏
  menu0:帮助
  xu:巡检
  menu1:实时告警
  p0:退出系统
  
实时监控
  a0:街景地图
  a1:区域监控(地图工具)
  a2:监控区域(地图工具)
  a3:监控省市(地图工具)
  a4:监控标注(地图工具)
  a5:画区域  (地图工具)
  a6:在线车辆(区域监控TAB)
  a7:离线车辆(区域监控TAB)
  a8:行驶车辆(区域监控TAB)
  a9:停止车辆(区域监控TAB)
  aa:报警车辆(区域监控TAB)
  
地图
  m0:选择地图
  m1:地址搜索
  m2:中心地址
  m3:位置采集
  m4:路径分析
  ma:卫星地图
  mb:普通地图
  mc:路况
  md:限速
  
实时视频
  v0:对讲
  v1:监听
  v2:广播
  
历史轨迹
  b0:速度分析(TAB)
  b1:停车分析(TAB)
  b2:区域分析(TAB)
  b3:点间行驶(TAB)
  b4:在线明细(TAB)
  b5:报警明细(TAB)
  b6:驾驶员登签(TAB)
  b7:开门记录(TAB)
  b8:异常分析(TAB)
  b9:异常里程(TAB)
  b10:KML档导出
  
整体统计
  c0:在线统计
  c1:车辆总数
  c2:在线行驶统计
  c3:在线点火统计
  c4:离线统计
  c5:报警统计
  
车辆树工具栏
  d0:分类显示(BAR)
  d1:统计显示(BAR)
  d2:在线统计
  d3:行停统计
  d4:报警统计
  d5:无效统计
  da:车辆显示
  db:车辆名称
  dc:车牌号码
  di:车牌颜色
  dd:车辆扩展
  de:信息卡号
  df:终端序号
  dg:司机姓名
  dh:车辆状态
  dm:车辆过滤(BAR)
  dn:所有车辆
  do:在线车辆
  dp:报警车辆
  dq:行驶车辆
  dr:停止车辆
  ds:离线车辆
  dt:无效定位

车辆树搜索栏
  e0:车辆搜索(BAR)
  e1:车辆名称
  e2:车牌号码
  e3:车辆扩展
  e4:信息卡号
  e5:终端序号
  e6:终端标识
  e7:司机姓名
  e8:驾驶证号
  e9:IC卡号
  em:分类搜索(BAR)
  en:分类名称
  eo:联系人员
  ep:联系电话
  eq:车队扩展
  
车辆管理
  f0:车辆名称
  f1:车牌颜色
  f2:驾驶员
  f3:部标视频
  fa:基础属性(TAB)
  fb:车身颜色
  fc:初始时长
  fd:核载
  fe:初始里程
  ff:里程修正
  fg:安装地址
  fh:部标属性(TAB)
  fi:VIN
  fj:安装时间
  
终端管理
  g0:SIM卡号
  g1:终端号
  g2:自定义
    
驾驶员管理
  h1:性别
  h2:联系电话
  h3:驾驶证号
  h4:IC卡号
  h5:绑定车辆
  
区域监控
  i0:省市监控
  
APP管理
  j0:消息盒子
  j1:配置用户
  j2:配置车辆
  
账号管理
  k0:性别
  
实时报警
  alarmButton1: 批量处理
**/
