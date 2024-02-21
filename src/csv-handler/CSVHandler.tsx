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

  const totalAmount = useRowsTotal({rows});

  useEffect(() => {
    setPreviousTokenDecimal(tokenDecimal || 0);
  }, [])

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
    setPreviousTokenDecimal(tokenDecimal || 0);
  }, [tokenDecimal])

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("uploading");
    const file = event.target.files?.[0];
    if (!file) return;
    parseData(file);   
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
        if(isNaN(Number(filteredData[0][1]))) {
          filteredData.shift();
        }
        while(isNaN(Number(filteredData[filteredData.length - 1][1])) || !Number(filteredData[filteredData.length - 1][1])) {
          filteredData.pop();
        }
        const finalData: IRow[] = filteredData.map((data: any) => {
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

  const isRowEditable = (rowIndex: number) => rowIndex === editableRow;
  const getRealAmount = (amount: string) => tokenDecimal ? toReal(amount, tokenDecimal) : new BigNumber(amount);
  const getDisplayAmount = (amount: string | BigNumber) => tokenDecimal ? toDisplay(amount, tokenDecimal) : amount;

  return (
    <div className="mt-8 w-full mx-auto">
      <div className="text-lg">Upload Address and Amounts</div>
      <div className="flex flex-row justify-between">
        <div
          className={`border p-2 w-full h-14 relative cursor-pointer ${
            dragging ? "bg-gray-200" : "bg-white"
          }`}
          ref={dragDiv}
        >
          {dragging ? "Drop to Upload" : "Drag and Drop or Click To Upload"}
          <input
            type="file"
            accept=".csv"
            className="absolute left-0 top-0 opacity-0 w-full h-full z-10 cursor-pointer"
            onChange={handleFileUpload}
          />
        </div>
        {
          rows.length ? 
          <button
            onClick={() => setRows([])}
            className="ml-2 z-10 px-4 text-white cursor-pointer bg-rose-500 rounded-lg"
          >
            Clear
          </button> :
          <button
            onClick={handlePaste}
            className="ml-2 z-10 px-4 text-white cursor-pointer bg-blue-500 rounded-lg"
          >
            Paste
          </button>
        }
      </div>
      <div className="border mt-4 p-2 w-full h-72">
        <div className="w-full h-64 overflow-auto">
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
                  <button onClick={() => {
                    setEditedAddress(row.address);
                    setEditedAmount(getDisplayAmount(row.amount).toString());
                    setEditableRow(index)
                  }}><Pencil /></button>
                }
                {
                  editableRow === null && isDeletable && 
                  <button
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
                    <button onClick={() => {
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
                    <button onClick={() => {
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
        <div className="sticky flex justify-between mb-1 bottom-0 ">
          <p className="font-semibold">Total Addresses: {rows.length}</p>
          <p className="font-semibold">
            Total Amount: {getDisplayAmount(totalAmount).toString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CSVHandler;
