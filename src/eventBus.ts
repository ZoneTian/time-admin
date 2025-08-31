import mitt from 'mitt'

// 定义事件类型
export interface DetailRow {
  nickname?: string;
  id: number | string;
  name?: string;
  title?: string;
  activityTitle?: string;
}

// 定义事件类型映射
type Events = {
  'open-member-detail': DetailRow;
  'open-activity-detail': DetailRow;
  'open-activity-create': void;  // 不需要参数
  'open-activity-edit': DetailRow;
  'close-current-tab': string;  // 关闭标签页，参数为标签页名称
};

// 创建带类型的eventBus
const eventBus = mitt<Events>();
export default eventBus;
