import { useThemeContext } from '../stores/themeContext';

function DeviceToggle() {
  const { deviceMode, setDeviceMode } = useThemeContext();

  return (
    <div className="device-toggle">
      <button className={deviceMode === 'mobile' ? 'active' : ''} type="button" onClick={() => setDeviceMode('mobile')}>
        手机
      </button>
      <button
        className={deviceMode === 'desktop' ? 'active' : ''}
        type="button"
        onClick={() => setDeviceMode('desktop')}
      >
        桌面
      </button>
    </div>
  );
}

export default DeviceToggle;
