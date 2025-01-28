import React, { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import { CheckBadge, Pencil, Trash, Undo } from "./Icons";
import { ICSVHandlerProps, IRow } from "./types";
import useRowsTotal from "./useRowsTotal";
import BigNumber from "bignumber.js";
import { toDisplay, toReal } from "./utils";

const CSVHandler = ({
  rows,
  setRows,
  tokenDecimal,
  isDeletable,
  isEditable
}: ICSVHandlerProps) => {
  const [editableRow, setEditableRow] = useState<number | null>(null)
  const [dragging, setDragging] = useState<boolean>(false);
  const dragDiv = useRef<HTMLDivElement>(null);
  const [editedAddress, setEditedAddress] = useState<string>("");
  const [editedAmount, setEditedAmount] = useState<string>("");
  const [previousTokenDecimal, setPreviousTokenDecimal] = useState<number>(0);
  const [file, setFile] = useState<File>();
  const inputRef = useRef<HTMLInputElement>(null);

  const totalAmount = useRowsTotal({ rows });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0]);
  };
  const handlePaste = async () => {
    const clipboardData = await navigator.clipboard.readText();
    parseData(clipboardData);
  };

  const parseData = (data: string | File) => {
    Papa.parse(data, {
      header: false,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result: Papa.ParseResult<string>) => {
        setRows([]);
        const filteredData = [...result.data]
        // omit first row if it's not an address
        if (isNaN(Number(filteredData[0][1]))) {
          filteredData.shift();
        }
        while (isNaN(Number(filteredData[filteredData.length - 1][1])) || !Number(filteredData[filteredData.length - 1][1])) {
          filteredData.pop();
        }
        const finalData: IRow[] = filteredData.map((data) => {
          const address = data[0];
          const amount = getRealAmount(data[1]);
          return {
            address: address,
            amount: amount,
          };
        });
        setRows(finalData);
      },
    });
  }

  useEffect(() => {
    if (!file) return;
    parseData(file);
  }, [file]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (rows.length === 0 && inputRef.current) {
      setFile(undefined);
      inputRef.current.value = '';
    }
  }, [rows])

  useEffect(() => {
    setPreviousTokenDecimal(tokenDecimal ?? 0);
  }, [tokenDecimal])

  useEffect(() => {
    if (tokenDecimal === previousTokenDecimal) return;
    setRows((oldRows) => {
      const newRows = oldRows.map(row => {
        const humanAmount = row.amount.dividedBy(new BigNumber(10).pow(previousTokenDecimal));
        const realAmount = humanAmount.multipliedBy(new BigNumber(10).pow(tokenDecimal ?? 0));
        return {
          ...row,
          amount: realAmount
        }
      })
      return newRows;
    })
    setPreviousTokenDecimal(tokenDecimal ?? 0);
  }, [tokenDecimal, previousTokenDecimal, setRows])

  useEffect(() => {
    const div = dragDiv.current;
    if (!div) return;
    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      setDragging(true);
    };
    const handleDragEnter = (event: DragEvent) => {
      event.preventDefault();
      setDragging(true);
    };
    const handleDragLeave = (event: DragEvent) => {
      event.preventDefault();
      setDragging(false);
    };
    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      setDragging(false);
      // Access the files
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0]; // Get the first file
        parseData(file);
      }
    };
    div.addEventListener("dragover", handleDragOver);
    div.addEventListener("dragenter", handleDragEnter);
    div.addEventListener("dragleave", handleDragLeave);
    div.addEventListener("drop", handleDrop);
    return () => {
      div.removeEventListener("dragover", handleDragOver);
      div.removeEventListener("dragenter", handleDragEnter);
      div.removeEventListener("dragleave", handleDragLeave);
      div.removeEventListener("drop", handleDrop);
    };
  }, [])

  const isRowEditable = (rowIndex: number) => rowIndex === editableRow;
  const getRealAmount = (amount: string) => tokenDecimal ? toReal(amount, tokenDecimal) : new BigNumber(amount);
  const getDisplayAmount = (amount: string | BigNumber) => tokenDecimal ? toDisplay(amount, tokenDecimal) : amount;

  return (
    <div className="mt-8 w-full mx-auto">
      <div className="py-2">Upload Address and Amounts</div>
      <div className="flex flex-row justify-between gap-x-4">
        <div
          className={`flex items-center justify-center text-gray-400 border w-full h-12 relative ${dragging ? "bg-gray-200 " : "bg-white"
            }`}
          ref={dragDiv}
        >
          {dragging ? "Drop to Upload" : "Drag and Drop or Click To Upload"}
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="absolute inset-0 opacity-0 z-10 cursor-pointer"
            title='Drag and Drop or Click To Upload .csv file'
            onChange={handleFileUpload}
          // onClick={(event) => {
          //   event.target.value = null
          // }}
          />
        </div>
        {
          rows.length ?
            <button
              onClick={() => setRows([])}
              className="px-7 text-white cursor-pointer bg-rose-500 rounded-lg"
            >
              Clear
            </button> :
            <button
              onClick={handlePaste}
              className="px-7 text-white cursor-pointer bg-blue-500 rounded-lg"
            >
              Paste
            </button>
        }
      </div>
      {rows.length !== 0 && <div className="flex flex-col border mt-4 px-2 pt-2 w-full max-h-72">
        <div className="w-full max-h-64 overflow-auto">
          {
            rows.map((row, index) => (
              <div
                key={`${row.address}-${row.amount}-${index.toString()}`}
                className={`grid grid-cols-[1fr_25fr_auto_auto_auto] gap-3 p-1 items-center ${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}
              >
                <span>{index + 1}</span>
                {
                  isRowEditable(index) ?
                    <input
                      type="text"
                      className="p-1 border-solid border-2 border-gray-300"
                      value={editedAddress}
                      onChange={(event) => setEditedAddress(event.target.value)}
                    /> :
                    <span>{row.address}</span>
                }
                {
                  isRowEditable(index) ?
                    <input
                      type="text"
                      className="p-1 border-solid border-2 border-gray-300 text-right"
                      value={editedAmount}
                      onChange={(event) => setEditedAmount(event.target.value)}
                    /> :
                    <span>{getDisplayAmount(row.amount).toString()}</span>
                }
                {
                  editableRow === null && isEditable &&
                  <button title="Edit" onClick={() => {
                    setEditedAddress(row.address);
                    setEditedAmount(getDisplayAmount(row.amount).toString());
                    setEditableRow(index)
                  }}><Pencil /></button>
                }
                {
                  editableRow === null && isDeletable &&
                  <button
                    title="Delete"
                    onClick={() => {
                      setRows((oldRows) => {
                        const newRows = [...oldRows];
                        newRows.splice(index, 1);
                        return newRows;
                      })
                    }}
                  >
                    <Trash />
                  </button>
                }
                {
                  isRowEditable(index) && <>
                    <button title="Save" onClick={() => {
                      setEditableRow(null)
                      setRows((oldRows) => {
                        const newRows = [...oldRows];
                        newRows[index].address = editedAddress;
                        newRows[index].amount = getRealAmount(editedAmount.replace(/,/g, '')); // removing commas
                        return newRows;
                      })
                      setEditedAddress("");
                      setEditedAmount("");
                    }}> <CheckBadge /> </button>
                    <button title="Undo" onClick={() => {
                      setEditableRow(null)
                      setEditedAddress("");
                      setEditedAmount("");
                    }}> <Undo /> </button>
                  </>
                }
              </div>
            ))
          }
        </div>
        <div className="sticky flex justify-between bottom-0 text-gray-400 py-2">
          <p>
            Total Addresses:{' '}
            <span className="font-semibold text-gray-900">{rows.length}</span>
          </p>
          <p>
            Total Amount:{' '}
            <span className="font-semibold text-gray-800">{getDisplayAmount(totalAmount).toString()}</span>
          </p>
        </div>
      </div>}
    </div>
  );
};

export default CSVHandler;
