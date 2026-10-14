export default function useInput(defaultValue = "") {
  let val = defaultValue;
  const value = {
    get value() {
      return val;
    },
    set value(v) {
      val = v;
    },
  };

  function handleValueChange(event) {
    value.value = event?.target?.value !== undefined ? event.target.value : event;
  }

  return [
    value,
    handleValueChange,
    (v) => {
      value.value = v;
    },
  ];
}
