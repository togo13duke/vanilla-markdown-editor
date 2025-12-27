# Contract: FileRepository

**Feature**: 003-file-management
**Date**: 2025-12-27
**Layer**: Repository（永続化層）

## Overview

IndexedDB を使用したファイルの CRUD 操作を提供する。すべてのメソッドは Promise を返し、async/await で使用可能。

## Interface

```typescript
interface FileEntity {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  sortKey: number;
}

interface FileRepository {
  /**
   * データベース接続を初期化する
   * @returns 初期化成功時は true、IndexedDB 利用不可時は false
   */
  init(): Promise<boolean>;

  /**
   * 全ファイルを取得する（updatedAt 降順）
   * @returns ファイルエンティティの配列
   */
  getAll(): Promise<FileEntity[]>;

  /**
   * ID でファイルを取得する
   * @param id - ファイルID
   * @returns ファイルエンティティ、存在しない場合は null
   */
  getById(id: string): Promise<FileEntity | null>;

  /**
   * ファイルを作成する
   * @param entity - 作成するファイルエンティティ
   * @returns 作成されたファイルエンティティ
   */
  create(entity: FileEntity): Promise<FileEntity>;

  /**
   * ファイルを更新する
   * @param entity - 更新するファイルエンティティ
   * @returns 更新されたファイルエンティティ
   */
  update(entity: FileEntity): Promise<FileEntity>;

  /**
   * ファイルを削除する
   * @param id - 削除するファイルID
   * @returns 削除成功時は true
   */
  delete(id: string): Promise<boolean>;
}
```

## Behavior Specifications

### init()

| Scenario | Input | Expected Output | Side Effects |
|----------|-------|-----------------|--------------|
| 正常初期化 | - | `true` | DB 接続確立、ObjectStore 作成 |
| IndexedDB 利用不可 | - | `false` | console.warn 出力 |
| 2回目以降の呼び出し | - | `true` | 既存接続を再利用 |

### getAll()

| Scenario | Input | Expected Output | Side Effects |
|----------|-------|-----------------|--------------|
| ファイルあり | - | `FileEntity[]` (updatedAt 降順) | - |
| ファイルなし | - | `[]` | - |
| DB 未初期化 | - | Error throw | - |

### getById(id)

| Scenario | Input | Expected Output | Side Effects |
|----------|-------|-----------------|--------------|
| 存在するID | 有効な UUID | `FileEntity` | - |
| 存在しないID | 無効な UUID | `null` | - |
| 不正な引数 | null/undefined | Error throw | - |

### create(entity)

| Scenario | Input | Expected Output | Side Effects |
|----------|-------|-----------------|--------------|
| 正常作成 | 有効な FileEntity | 作成された `FileEntity` | DB にレコード追加 |
| 重複ID | 既存IDのエンティティ | Error throw | - |
| 不正なエンティティ | 必須フィールド欠損 | Error throw | - |

### update(entity)

| Scenario | Input | Expected Output | Side Effects |
|----------|-------|-----------------|--------------|
| 正常更新 | 有効な FileEntity | 更新された `FileEntity` | DB レコード更新 |
| 存在しないID | 無効なIDのエンティティ | Error throw | - |
| 不正なエンティティ | 必須フィールド欠損 | Error throw | - |

### delete(id)

| Scenario | Input | Expected Output | Side Effects |
|----------|-------|-----------------|--------------|
| 正常削除 | 有効な UUID | `true` | DB からレコード削除 |
| 存在しないID | 無効な UUID | `true` (冪等性) | - |
| 不正な引数 | null/undefined | Error throw | - |

## Error Handling

| Error Type | Cause | Handling |
|------------|-------|----------|
| `DatabaseNotInitializedError` | init() 前のメソッド呼び出し | 呼び出し元で init() を確認 |
| `EntityValidationError` | 不正なエンティティ | 呼び出し元でバリデーション |
| `DatabaseError` | IndexedDB 操作失敗 | ユーザーに通知、リトライ検討 |

## Usage Example

```javascript
import { fileRepository } from './repositories/fileRepository.js';

// 初期化
const isAvailable = await fileRepository.init();
if (!isAvailable) {
  showWarning('IndexedDB is not available');
}

// 全件取得
const files = await fileRepository.getAll();

// 作成
const newFile = await fileRepository.create({
  id: crypto.randomUUID(),
  title: '無題',
  content: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  sortKey: Date.now()
});

// 更新
const updated = await fileRepository.update({
  ...newFile,
  content: '# Hello',
  updatedAt: Date.now()
});

// 削除
await fileRepository.delete(newFile.id);
```
