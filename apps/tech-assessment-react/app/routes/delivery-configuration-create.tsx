import styles from './../app.module.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BreadcrumbItem, MenuListItem, SidebarItem } from '@atpco/atp-web';
const API_BASE_URL = '/api/three-v-deliveries';

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Collections', id: 'collections', route: 'collections', children: [] },
  {
    name: 'Manage',
    id: 'manage',
    route: 'manage',
    children: [
      { name: 'Input configurations', id: 'input-configurations', route: 'input-configurations' },
      {
        name: 'Output configurations',
        id: 'output-configurations',
        route: 'output-configurations',
      },
      {
        name: 'Packaging configurations',
        id: 'packaging-configurations',
        route: 'packaging-configurations',
      },
      {
        name: 'Delivery configuration',
        id: 'delivery-configuration',
        route: 'delivery-configuration',
      },
    ],
  },
];

const BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { name: 'Manage', href: '/manage' },
  { name: 'Delivery configuration', href: '/delivery-configuration' },
];

type DeliveryLocationId = 'email' | 'gcloud' | 'azure' | 's3';

const DELIVERY_LOCATION_ITEMS: MenuListItem[] = [
  { name: 'Email', id: 'email' },
  { name: 'Google Cloud', id: 'gcloud' },
  { name: 'Azure', id: 'azure' },
  { name: 'S3', id: 's3' },
];

export default function DeliveryConfigurationCreateRoute() {
  const [activeSidebarId, setActiveSidebarId] = useState('delivery-configuration');
  const [deliveryName, setDeliveryName] = useState('');
  const [customer, setCustomer] = useState('');
  const [deliveryFrequency, setDeliveryFrequency] = useState('');
  const [lastFileSuffix, setLastFileSuffix] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocationId | ''>('s3');
  const [deliveryFileName, setDeliveryFileName] = useState('');

  // email-only fields
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // cloud-only fields (gcloud / azure / s3)
  const [bucket, setBucket] = useState<string>('');
  const [credentialsFile, setCredentialsFile] = useState<string>('');
  const [uploadOption, setUploadOption] = useState<string>('');

  // option toggles
  const [combineFiles, setCombineFiles] = useState(false);
  const [specificDirectory, setSpecificDirectory] = useState(false);
  const [virusScan, setVirusScan] = useState(false);
  const [encrypt, setEncrypt] = useState(false);

  // combineFiles-only fields
  const [maximumFileSize, setMaximumFileSize] = useState<string>('');
  const [compression, setCompression] = useState(false);

  const headerRef = useRef<HTMLElementTagNameMap['atp-header']>(null);
  const sidebarRef = useRef<HTMLElementTagNameMap['atp-sidebar']>(null);
  const breadcrumbsRef = useRef<HTMLElementTagNameMap['atp-breadcrumbs']>(null);
  const submitButtonRef = useRef<HTMLElementTagNameMap['atp-button']>(null);

  const [isCronValid, setIsCronValid] = useState(true);
  const [isLastFileSuffixValid, setIsLastFileSuffixValid] = useState(true);
  const [isDeliveryFileNameValid, setIsDeliveryFileNameValid] = useState(true);
  const [isRecipientsValid, setIsRecipientsValid] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isServerError, setIsServerError] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [configData, setConfigData] = useState<ThreeVDeliveryListResponse | null>(null);

  // Callback ref: marks any atp-input as required on mount.
  const requiredInputRef = useCallback(
    (el: HTMLElementTagNameMap['atp-input'] | null) => {
      if (el) el.required = true;
    },
    [],
  );

  // Callback ref: same as above, but also enables textarea mode (for multi-line fields).
  const requiredTextareaInputRef = useCallback(
    (el: HTMLElementTagNameMap['atp-input'] | null) => {
      if (el) {
        el.required = true;
        el.textarea = true;
      }
    },
    [],
  );

  const alertRef = useCallback(
  (el: HTMLElementTagNameMap['atp-alert'] | null) => {
    if (!el) return;

    //close button
    const onClose = () => {
      setIsServerError(false);
      setServerError(null);
      setIsSuccess(false);
    };
    el.addEventListener('closeEventOutput', onClose);

    // Scroll into view when an alert is set
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // store cleanup on the element so we can call it on unmount
    return () => el.removeEventListener('closeEventOutput', onClose);
  },
  [],
);

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.label = 'PriceEye';
      headerRef.current.org = 'ATPCO';
    }

    if (sidebarRef.current) {
      sidebarRef.current.items = SIDEBAR_ITEMS;
      sidebarRef.current.outputNavigationEvents = true;
    }

    if (breadcrumbsRef.current) {
      breadcrumbsRef.current.itemsList = BREADCRUMB_ITEMS;
    }

    // GET existing data once on mount
    fetchExistingData().then((data) => {
      if(!data.success){
        console.error('Failed to fetch existing data:', data.error);
        return;
      }
      setConfigData(data.responseData);
    });
  }, []);

  useEffect(() => {
    if(configData) {
      console.log(configData.data);
    }
  }, [configData]);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) {
      return;
    }

    sidebar.activeId = activeSidebarId;

    const onSidebarNavigation = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      if (detail?.id) {
        setActiveSidebarId(detail.id);
      }
    };

    sidebar.addEventListener('navigationEventOutput', onSidebarNavigation);

    return () => {
      sidebar.removeEventListener('navigationEventOutput', onSidebarNavigation);
    };
  }, [activeSidebarId]);


  const resetForm = useCallback(() => {
    setDeliveryName('');
    setCustomer('');
    setDeliveryFrequency('');
    setLastFileSuffix('');
    setDeliveryLocation('s3');
    setDeliveryFileName('');
    setRecipients('');
    setSubject('');
    setBody('');
    setBucket('');
    setCredentialsFile('');
    setUploadOption('');
    setCombineFiles(false);
    setSpecificDirectory(false);
    setVirusScan(false);
    setEncrypt(false);
    setMaximumFileSize('');
    setCompression(false);
  }, []);

  const handleSubmit = useCallback(() => {
    setIsCronValid(true);
    setIsLastFileSuffixValid(true);
    setIsDeliveryFileNameValid(true);
    setIsRecipientsValid(true);
    setIsServerError(false);
    setServerError(null);
    setIsSuccess(false);

    const payload = {
      deliveryName,
      customer,
      deliveryFrequency,
      "last_file_suffix": lastFileSuffix,
      deliveryLocation,
      deliveryFileName,
      ...(deliveryLocation === 'email'
        ? { recipients: recipients, subject, body }
        : { bucket, credentialsFile, "upload_option": uploadOption }),
      combineFiles,
      ...(combineFiles ? { maximumFileSize: Number(maximumFileSize), compression } : {}),
      specificDirectory,
      virusScan,
      encrypt,
    };

    const requiredFields = [
    deliveryName,
    customer,
    deliveryFileName,
    deliveryLocation,
    ...(deliveryLocation === 'email' ? [recipients] : [bucket, credentialsFile, uploadOption]),
    ...(combineFiles ? [maximumFileSize] : []),
    ];

    // check for required fields
    if (requiredFields.some((field) => field.trim() === '')) {
      setIsServerError(true);
      setServerError('Please fill in all required fields before submitting.');
      return;
    }

    if(!validateInput('cron', deliveryFrequency)) {
      setIsCronValid(false);
      return;
    }

    // check for valid inputs
    if(!validateInput('file', lastFileSuffix)) {
      setIsLastFileSuffixValid(false);
      return;
    }

    if(!validateInput('file', deliveryFileName)) {
      setIsDeliveryFileNameValid(false);
      return;
    }

    if(deliveryLocation === 'email' && !validateInput('email', recipients)) {
      setIsRecipientsValid(false);
      return;
    }

    const forceError = typeof window !== 'undefined' && 
      new URLSearchParams(window.location.search).get('error') === 'true';
    postDeliveryConfiguration(payload, forceError).then((response) => {
      if(!response.success){
        console.error('Submission failed due to an error:', response.error);
        setIsServerError(true);
        setServerError(response.error || 'An unknown error occurred.');
        return;
      }

      console.log('Submission successful');
      setIsSuccess(true);
      resetForm();
  });
  }, [
    deliveryName,
    customer,
    deliveryFrequency,
    lastFileSuffix,
    deliveryLocation,
    deliveryFileName,
    recipients,
    subject,
    body,
    bucket,
    credentialsFile,
    uploadOption,
    combineFiles,
    maximumFileSize,
    compression,
    specificDirectory,
    virusScan,
    encrypt,
  ]);

  // atp-button doesn't natively submit forms; bridge its `clickEventOutput` to handleSubmit.
  useEffect(() => {
    const button = submitButtonRef.current;
    if (!button) return;
    const onClick = () => handleSubmit();
    button.addEventListener('clickEventOutput', onClick);
    return () => {
      button.removeEventListener('clickEventOutput', onClick);
    };
  }, [handleSubmit]);

  return (
    <div className="atp-layout">
      <atp-header ref={headerRef} className="layout-header"></atp-header>

      <atp-sidebar ref={sidebarRef} className="layout-sidebar"></atp-sidebar>

      <div className="scroll-wrapper">
        <div className="page-content">
          {(isServerError || isSuccess) && 
              <atp-alert
                ref={alertRef}
                label={
                  isServerError
                    ? (serverError ?? 'An unknown error occurred.')
                    : 'Delivery configuration created successfully!'
                }
                appearance="toast"
                color={isServerError ? "danger" : "info"}
                hasClose
              />
          }
          <atp-breadcrumbs ref={breadcrumbsRef}></atp-breadcrumbs>
          <h1 className="view-title">Create delivery configuration</h1>
          <form
            className={styles.deliveryConfigForm}
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <atp-input ref={requiredInputRef}>
              <label slot="label" htmlFor="delivery-name">
                Delivery configuration name
              </label>
              <input
                id="delivery-name"
                name="deliveryName"
                type="text"
                value={deliveryName}
                onChange={(event) => setDeliveryName(event.target.value)}
              />
            </atp-input>
            <atp-input ref={requiredInputRef}>
              <label slot="label" htmlFor="customer">
                Customer
              </label>
              <input
                id="customer"
                name="customer"
                type="text"
                value={customer}
                onChange={(event) => setCustomer(event.target.value)}
              />
            </atp-input>
            <atp-input isError={!isCronValid}>
              <label slot="label" htmlFor="delivery-frequency">
                Delivery frequency in cron format
              </label>
              <input
                id="delivery-frequency"
                name="deliveryFrequency"
                type="text"
                value={deliveryFrequency}
                onChange={(event) => setDeliveryFrequency(event.target.value)}
                onBlur={(event) => {
                  setIsCronValid(true);
                  const value = event.target.value;
                  if (value && !validateInput('cron', value)) {
                    setIsCronValid(false);
                  }
                }}
              />
              <span slot="help-text">
                {!isCronValid && <span>Cron format is invalid.{' '}</span>}
                For more information on cron format visit{' '}
                <a href="https://crontab.cronhub.io" target="_blank" rel="noopener noreferrer">
                  crontab.cronhub.io
                </a>
                .
              </span>
            </atp-input>
            <atp-input isError={!isLastFileSuffixValid}>
              <label slot="label" htmlFor="last-file-suffix">
                Last file suffix
              </label>
              <input
                id="last-file-suffix"
                name="lastFileSuffix"
                type="text"
                value={lastFileSuffix}
                onChange={(event) => setLastFileSuffix(event.target.value)}
                onBlur={(event) => {
                  setIsLastFileSuffixValid(true);
                  const value = event.target.value;
                  if (value && !validateInput('file', value)) {
                    setIsLastFileSuffixValid(false);
                  }
                }}
              />
              <span slot="help-text">
                {isLastFileSuffixValid
                  ? 'Input can only contain letters, numbers, -, and _'
                  : 'Invalid last file suffix entered. Only letters, numbers, -, and _ are allowed.'}
              </span>
            </atp-input>

            <AtpDropdownField
              id="delivery-location"
              name="deliveryLocation"
              label="Delivery location"
              items={DELIVERY_LOCATION_ITEMS}
              value={deliveryLocation}
              onChange={(id) => setDeliveryLocation(id as DeliveryLocationId | '')}
              required
            />
            {deliveryLocation !== '' && (
              <atp-card className={styles.deliveryLocationDetailsCard}>
                <div className={styles.cardContent}>
                {deliveryLocation === 'email' ? (
                  <>
                    <atp-input ref={requiredInputRef} isError={!isRecipientsValid}>
                      <label slot="label" htmlFor="recipient">
                        Recipient email(s)
                      </label>
                      <input
                        id="recipient"
                        name="recipients"
                        type="text"
                        value={recipients}
                        onChange={(event) => setRecipients(event.target.value)}
                        onBlur={(event) => {
                          setIsRecipientsValid(true);
                          const value = event.target.value;
                          if (value && !validateInput('email', value)) {
                            setIsRecipientsValid(false);
                          }
                        }}
                      />
                      <span slot="help-text">
                        {isRecipientsValid
                          ? 'Separate multiple addresses with commas.'
                          : 'One or more email addresses are invalid. Separate multiple addresses with commas.'}
                      </span>
                    </atp-input>
                    <atp-input ref={requiredInputRef}>
                      <label slot="label" htmlFor="subject">
                        Subject
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                      />
                    </atp-input>
                    <atp-input ref={requiredTextareaInputRef}>
                      <label slot="label" htmlFor="body">
                        Body
                      </label>
                      <textarea
                        id="body"
                        name="body"
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                      />
                    </atp-input>
                  </>
                ) : (
                  <>
                    <atp-input ref={requiredInputRef}>
                      <label slot="label" htmlFor="bucket">
                        Bucket
                      </label>
                      <input
                        id="bucket"
                        name="bucket"
                        type="text"
                        value={bucket}
                        onChange={(event) => setBucket(event.target.value)}
                      />
                    </atp-input>
                    <atp-input ref={requiredInputRef}>
                      <label slot="label" htmlFor="credentials-file">
                        Credentials file
                      </label>
                      <input
                        id="credentials-file"
                        name="credentialsFile"
                        type="text"
                        value={credentialsFile}
                        onChange={(event) => setCredentialsFile(event.target.value)}
                      />
                    </atp-input>
                    <atp-input ref={requiredInputRef}>
                      <label slot="label" htmlFor="upload-option">
                        Upload option
                      </label>
                      <input
                        id="upload-option"
                        name="uploadOption"
                        type="text"
                        value={uploadOption}
                        onChange={(event) => setUploadOption(event.target.value)}
                      />
                    </atp-input>
                  </>
                )}
                </div>
              </atp-card>
            )}
            <atp-input ref={requiredInputRef} isError={!isDeliveryFileNameValid}>
              <label slot="label" htmlFor="delivery-file-name">
                Delivery File Name
              </label>
              <input
                id="delivery-file-name"
                name="deliveryFileName"
                type="text"
                value={deliveryFileName}
                onChange={(event) => setDeliveryFileName(event.target.value)}
                onBlur={(event) => {
                  setIsDeliveryFileNameValid(true);
                  const value = event.target.value;
                  if (value && !validateInput('file', value)) {
                    setIsDeliveryFileNameValid(false);
                  }
                }}
              />
              {isDeliveryFileNameValid
                  ? 'Input can only contain letters, numbers, -, and _'
                  : 'Invalid last file suffix entered. Only letters, numbers, -, and _ are allowed.'}
            </atp-input>

            <AtpCheckbox
              label="Combine files"
              name="combineFiles"
              checked={combineFiles}
              onChange={setCombineFiles}
            />

            {combineFiles && (
              <atp-card>
                <div className={styles.cardContent}>
                <atp-input ref={requiredInputRef}>
                  <label slot="label" htmlFor="maximum-file-size">
                    Maximum file size (MB)
                  </label>
                  <input
                    id="maximum-file-size"
                    name="maximumFileSize"
                    type="number"
                    value={maximumFileSize}
                    onChange={(event) => setMaximumFileSize(event.target.value)}
                  />
                </atp-input>
                <AtpCheckbox
                  label="Check file size post compression"
                  name="compression"
                  checked={compression}
                  onChange={setCompression}
                />
                </div>
              </atp-card>
            )}

            <AtpCheckbox
              label="Place files into specific delivery directory"
              name="specificDirectory"
              checked={specificDirectory}
              onChange={setSpecificDirectory}
            />
            <AtpCheckbox
              label="Virus scan"
              name="virusScan"
              checked={virusScan}
              onChange={setVirusScan}
            />
            <AtpCheckbox
              label="Use encryption"
              name="encrypt"
              checked={encrypt}
              onChange={setEncrypt}
            />
            <atp-button ref={submitButtonRef} label="Submit"></atp-button>
          </form>
        </div>
      </div>
    </div>
  );
}

type ThreeVDeliveryRecord = { id: number; acceptedAt: string; [k: string]: unknown };
type ThreeVDeliveryListResponse = { count: number; data:ThreeVDeliveryRecord[] };

async function fetchExistingData(): Promise<{success: boolean, responseData: ThreeVDeliveryListResponse | null, error?: string}> {
  try{
    const response = await fetch(API_BASE_URL);

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const json: ThreeVDeliveryListResponse = await response.json();
    const sorted = json.data.sort(
      (a, b) => new Date(a.acceptedAt).getTime() - new Date(b.acceptedAt).getTime()
    );

    return { success: true, responseData: { count: sorted.length, data: sorted } };
  } catch (error) {
    console.error('Error fetching existing delivery configurations:', error);
    return { success: false, responseData: null, error: (error as Error).message };
  }
}

async function postDeliveryConfiguration(payload: any, forceError: boolean): Promise<{success: boolean, error?: string}> {
  try {
    console.log(`Forcing error: ${forceError}`);
    const response = await fetch(`${API_BASE_URL}${forceError ? '?error=true' : ''}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    if (!response.ok) {
      const detail = responseData.errors?.join('; ') ?? responseData.message ?? response.statusText;
      throw new Error(detail);
    }

    console.log('Delivery configuration submitted successfully:', responseData);
    return { success: true };
  } catch (error) {
    let e = error as Error;
    console.error('Error submitting delivery configuration:', e.stack);
    return { success: false, error: e.message };
  }
}

interface InputTypes {
  'email': string;
  'cron': string;
  'file': string;
}

function validateInput(inputType: keyof InputTypes, value: string): boolean {
  let input = value.trim();
  switch (inputType) {
    case 'email':
      // Basic single-email regex pattern
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Allow one or more comma-separated addresses; validate each individually.
      const addresses = input.split(',').map((a) => a.trim()).filter((a) => a.length > 0);
      const isValidEmail = addresses.length > 0 && addresses.every((a) => emailPattern.test(a));
      if (!isValidEmail) {
        console.error('Invalid email address(es):', input);
      }
      return isValidEmail;
    case 'cron':
      // Basic cron regex pattern (5 fields with numbers, *, /, -, and ,)
      const cronPattern = /^(\*|([0-5]?\d))(\/\d+)?(\s+(\*|([01]?\d|2[0-3]))(\/\d+)?){4}$/;
      const isValidCron = cronPattern.test(input);
      if (!isValidCron) {
        console.error('Invalid cron expression:', input);
      }
      return isValidCron;
    case 'file':
      // Allow letters, numbers, dashes, and underscores; no spaces
      const filePattern = /^[a-zA-Z0-9_-]+$/;
      const isValidFile = filePattern.test(input);
      if (!isValidFile) {
        console.error('Invalid file name:', input);
      }
      return isValidFile;
    default:
      return false;
  }
}

interface AtpDropdownFieldProps {
  id: string;
  name: string;
  label: string;
  items: MenuListItem[];
  value: string;
  onChange: (id: string) => void;
  required?: boolean;
}

function AtpDropdownField({
  id,
  name,
  label,
  items,
  value,
  onChange,
  required,
}: AtpDropdownFieldProps) {
  const inputRef = useRef<HTMLElementTagNameMap['atp-input']>(null);
  const dropdownRef = useRef<HTMLElementTagNameMap['atp-dropdown']>(null);

  // Mount-time setup: push items into the dropdown and toggle required on the input.
  useEffect(() => {
    if (dropdownRef.current) {
      dropdownRef.current.itemsList = items;
    }
    if (inputRef.current) {
      inputRef.current.required = Boolean(required);
    }
  }, [items, required]);

  // Sync the selected id down to the dropdown and listen for user selections.
  useEffect(() => {
    const dropdown = dropdownRef.current;
    if (!dropdown) return;

    dropdown.activeIds = value ? [value] : [];

    const onItemSelected = (event: Event) => {
      const detail = (event as CustomEvent<string[]>).detail;
      const selectedId = detail?.[0];
      if (selectedId) {
        onChange(selectedId);
      }
    };

    dropdown.addEventListener('itemSelectedOutput', onItemSelected);
    return () => {
      dropdown.removeEventListener('itemSelectedOutput', onItemSelected);
    };
  }, [value, onChange]);

  const displayValue = items.find((item) => item.id === value)?.name ?? '';

  return (
    <atp-input ref={inputRef}>
      <label slot="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        readOnly
        value={displayValue}
      />
      <atp-dropdown ref={dropdownRef} slot="dropdown" />
    </atp-input>
  );
}

interface AtpCheckboxProps {
  label: string;
  name?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

function AtpCheckbox({ label, name, checked, onChange }: AtpCheckboxProps) {
  const ref = useRef<HTMLElementTagNameMap['atp-checkbox']>(null);

  // Push controlled `checked` state down to the web component.
  useEffect(() => {
    if (ref.current) {
      ref.current.checked = checked;
    }
  }, [checked]);

  // Listen for user-driven toggles and notify the parent.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => onChange(el.checked);
    el.addEventListener('changeEventOutput', handler);
    return () => {
      el.removeEventListener('changeEventOutput', handler);
    };
  }, [onChange]);

  return <atp-checkbox ref={ref} label={label} name={name}></atp-checkbox>;
}
