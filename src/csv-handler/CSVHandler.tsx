import React, { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import { CheckBadge, Pencil, Trash, Undo } from "./Icons";
import { ICSVHandlerProps, IRow } from "./types";
import useRowsTotal from "./useRowsTotal";
import BigNumber from "bignumber.js";

const CSVHandler = ({
  // rows,
  setRows,
  formatters,
  isDeletable,
  isEditable
}: ICSVHandlerProps) => {
  const [originalRows, setOriginalRows] = useState<IRow[]>([]);
  const [editableRow, setEditableRow] = useState<number | null>(null)
  const [dragging, setDragging] = useState<boolean>(false);
  const dragDiv = useRef<HTMLDivElement>(null);
  const [editedAddress, setEditedAddress] = useState<string>("");
  const [editedAmount, setEditedAmount] = useState<string>("");

  const totalAmount = useRowsTotal(originalRows);

  useEffect(() => {
    if(!originalRows.length) return;
    setRows(() => {
      const realRows =  originalRows.map(row => {
        return {
          address: row.address,
          amount: formatters ? formatters.toReal(row.amount) : row.amount
        }
      })
      return realRows;
    })
  }, [originalRows])

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
        const originalData = filteredData.map((data: any) => {
          const address = data[0];
          const amount = new BigNumber(data[1]);
          return {
            address: address,
            amount: amount,
          };
        });
        setOriginalRows(originalData);
      },
    });
  }

  const getNumberWithCommas = (num: string | BigNumber) => {
    return new Intl.NumberFormat("en-US", {
			maximumFractionDigits: 18,
		}).format(parseFloat(num.toString()));
  }

  const isRowEditable = (rowIndex: number) => rowIndex === editableRow;
  // const getRealAmount = (amount: string) => formatters ? formatters.toReal(amount) : new BigNumber(amount);
  // const getDisplayAmount = (amount: string | BigNumber) => formatters ? formatters.toDisplay(amount) : amount;

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
          originalRows.length ? 
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
            originalRows.map((row, index) => (
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
                  <span>{getNumberWithCommas(row.amount)}</span>
                }
                {
                  editableRow === null && isEditable && 
                  <button onClick={() => {
                    setEditedAddress(row.address);
                    setEditedAmount(getNumberWithCommas(row.amount));
                    setEditableRow(index)
                  }}><Pencil /></button>
                }
                {
                  editableRow === null && isDeletable && 
                  <button
                    onClick={() => {
                      setOriginalRows((oldRows) => {
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
                      setOriginalRows((oldRows) => {
                        const newRows = [...oldRows];
                        newRows[index].address = editedAddress;
                        newRows[index].amount = new BigNumber(editedAmount.replace(/,/g, '')); // removing commas
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
          <p className="font-semibold">Total Addresses: {originalRows.length}</p>
          <p className="font-semibold">
            Total Amount: {totalAmount.toString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CSVHandler;
