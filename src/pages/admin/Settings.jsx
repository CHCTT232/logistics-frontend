import React from 'react';
import { Form, InputNumber, Card, Button, message } from 'antd';

const Settings = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('运费设置:', values);
    // TODO: 调用后端API保存设置
    message.success('设置已保存');
  };

  return (
    <div>
      <h2>系统设置</h2>
      <Card title="运费设置" style={{ maxWidth: 600 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            basePrice: 6,
            baseDistance: 50,
            volumeRatio: 6000,
            driverRatio: 0.83,
          }}
        >
          <Form.Item
            label="基础运费（元）"
            name="basePrice"
            rules={[{ required: true, message: '请输入基础运费' }]}
            tooltip="40*40*40/6000的载物箱运输50KM的基础运费"
          >
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="基础距离（公里）"
            name="baseDistance"
            rules={[{ required: true, message: '请输入基础距离' }]}
            tooltip="基础运费对应的运输距离"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="抛比系数"
            name="volumeRatio"
            rules={[{ required: true, message: '请输入抛比系数' }]}
            tooltip="体积重量换算系数"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="司机分成比例"
            name="driverRatio"
            rules={[{ required: true, message: '请输入司机分成比例' }]}
            tooltip="司机获得运费的比例（0-1之间）"
          >
            <InputNumber min={0} max={1} step={0.01} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings; 