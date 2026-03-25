import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import K8sNameDescriptionField from '../K8sNameDescriptionField';
import { K8sNameDescriptionFieldData } from '../types';
import { setupDefaults } from '../utils';

jest.mock('~/app/pages/modelRegistry/screens/components/FormFieldset', () => ({
  __esModule: true,
  default: ({ component }: { component: React.ReactNode }) => <>{component}</>,
}));

jest.mock('~/concepts/k8s/ResourceNameDefinitionTooltip', () => ({
  __esModule: true,
  default: () => <span>tooltip</span>,
}));

const createValidData = (
  overrides?: Partial<K8sNameDescriptionFieldData>,
): K8sNameDescriptionFieldData => ({
  ...setupDefaults({}),
  ...overrides,
});

describe('K8sNameDescriptionField', () => {
  it('should render name input without error when name is valid', () => {
    const data = createValidData({ name: 'valid-name' });
    render(<K8sNameDescriptionField data={data} dataTestId="test" />);

    const nameInput = screen.getByTestId('test-name');
    expect(nameInput).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByTestId('test-name-error')).not.toBeInTheDocument();
  });

  it('should show error when name exceeds maxLength', () => {
    const longName = 'a'.repeat(254);
    const data = createValidData({
      name: longName,
      nameState: { invalidLength: true, maxLength: 253 },
    });

    render(<K8sNameDescriptionField data={data} dataTestId="test" />);

    expect(screen.getByTestId('test-name-error')).toHaveTextContent(
      'Cannot exceed 253 characters',
    );
  });

  it('should not show error when name is exactly at maxLength', () => {
    const exactName = 'a'.repeat(253);
    const data = createValidData({
      name: exactName,
      nameState: { invalidLength: false, maxLength: 253 },
    });

    render(<K8sNameDescriptionField data={data} dataTestId="test" />);

    expect(screen.queryByTestId('test-name-error')).not.toBeInTheDocument();
  });

  it('should apply error validation to TextInput when name is invalid', () => {
    const data = createValidData({
      name: 'a'.repeat(254),
      nameState: { invalidLength: true, maxLength: 253 },
    });

    render(<K8sNameDescriptionField data={data} dataTestId="test" />);

    const nameInput = screen.getByTestId('test-name');
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('should call onDataChange when name is updated', () => {
    const data = createValidData();
    const onDataChange = jest.fn();

    render(
      <K8sNameDescriptionField data={data} onDataChange={onDataChange} dataTestId="test" />,
    );

    fireEvent.change(screen.getByTestId('test-name'), { target: { value: 'new-name' } });
    expect(onDataChange).toHaveBeenCalledWith('name', 'new-name');
  });

  it('should hide description when hideDescription is true', () => {
    const data = createValidData();
    render(<K8sNameDescriptionField data={data} dataTestId="test" hideDescription />);

    expect(screen.queryByTestId('test-description')).not.toBeInTheDocument();
  });

  it('should show description by default', () => {
    const data = createValidData();
    render(<K8sNameDescriptionField data={data} dataTestId="test" />);

    expect(screen.getByTestId('test-description')).toBeInTheDocument();
  });

  it('should display custom error message with correct maxLength', () => {
    const data = createValidData({
      name: 'a'.repeat(101),
      nameState: { invalidLength: true, maxLength: 100 },
    });

    render(<K8sNameDescriptionField data={data} dataTestId="test" />);

    expect(screen.getByTestId('test-name-error')).toHaveTextContent(
      'Cannot exceed 100 characters',
    );
  });
});
