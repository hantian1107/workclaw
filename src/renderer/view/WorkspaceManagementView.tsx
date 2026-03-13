import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Workspace } from '../service/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Plus, 
  Link as LinkIcon, 
  Briefcase, 
  Search,
  MoreVertical,
  Clock,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';

interface WorkspaceManagementViewProps {
  workspaces: Workspace[];
  onCreateWorkspace: (name: string) => void;
  onAddResource: (workspaceId: string, resource: string) => void;
}

const WorkspaceManagementView: React.FC<WorkspaceManagementViewProps> = ({
  workspaces,
  onCreateWorkspace,
  onAddResource
}) => {
  const navigate = useNavigate();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(workspaces[0]?.id || '');
  const [resourcePath, setResourcePath] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleCreate = () => {
    if (newWorkspaceName.trim()) {
      onCreateWorkspace(newWorkspaceName);
      setNewWorkspaceName('');
    }
  };

  const handleAddResource = () => {
    if (selectedWorkspaceId && resourcePath.trim()) {
      onAddResource(selectedWorkspaceId, resourcePath);
      setResourcePath('');
    }
  };

  const filteredWorkspaces = workspaces.filter(ws => 
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (ws.description && ws.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col flex-1 h-full bg-slate-50/50">
      {/* Top Header Bar */}
      <header className="flex sticky top-0 z-10 justify-between items-center px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full hover:bg-slate-100"
            title="返回首页"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">工作空间管理</h1>
            <p className="text-xs text-slate-500">Workspace Management</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
           <div className="hidden relative w-64 md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="搜索工作空间..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 transition-all bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <div className="flex items-center p-1 rounded-lg bg-slate-100">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className={`h-7 w-7 p-0 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className={`h-7 w-7 p-0 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="overflow-hidden flex-1">
        <div className="flex flex-col gap-8 p-6 mx-auto w-full max-w-7xl h-full lg:flex-row">
          
          {/* Main Content: Workspace List */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="flex items-center text-lg font-semibold text-slate-800">
                <Briefcase className="mr-2 w-5 h-5 text-primary" />
                我的工作空间
                <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {filteredWorkspaces.length}
                </span>
              </h2>
            </div>
            
            <ScrollArea className="flex-1 px-2 -mx-2">
              {filteredWorkspaces.length > 0 ? (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4 pb-10" : "flex flex-col space-y-3 pb-10"}>
                  {filteredWorkspaces.map(ws => (
                    <div
                      key={ws.id}
                      className={`
                        group relative bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-default overflow-hidden
                        ${viewMode === 'list' ? 'flex items-center p-4 space-x-4' : 'flex flex-col p-5 space-y-4'}
                      `}
                    >
                      {/* Decorative gradient top border for grid view */}
                      {viewMode === 'grid' && (
                        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r opacity-0 transition-opacity from-primary/40 to-purple-500/40 group-hover:opacity-100" />
                      )}

                      <div className="flex justify-between items-start w-full">
                        <div className="flex items-center space-x-3">
                          <div className={`
                            flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-lg transition-colors
                            ${viewMode === 'list' ? 'w-10 h-10 bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary' : 'w-12 h-12 bg-slate-50 text-slate-700 group-hover:bg-primary/5 group-hover:text-primary'}
                          `}>
                            {ws.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="pr-4 font-semibold truncate text-slate-900">{ws.name}</h3>
                            {viewMode === 'list' && (
                              <p className="text-xs text-slate-500 truncate max-w-[300px]">{ws.description || '暂无描述'}</p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 transition-opacity text-slate-400 hover:text-slate-600 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      {viewMode === 'grid' && (
                        <>
                          <p className="h-10 text-sm text-slate-500 line-clamp-2">
                            {ws.description || '暂无描述信息...'}
                          </p>
                          <div className="flex justify-between items-center pt-4 mt-auto text-xs border-t border-slate-50 text-slate-400">
                            <div className="flex items-center">
                              <Clock className="mr-1 w-3 h-3" />
                              <span>最近更新: 今天</span>
                            </div>
                            <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-mono">
                              ID: {ws.id.slice(0, 6)}
                            </span>
                          </div>
                        </>
                      )}
                      
                      {viewMode === 'list' && (
                        <div className="flex items-center ml-auto space-x-4 text-xs text-slate-400">
                           <span className="hidden items-center md:flex">
                              <Clock className="mr-1 w-3 h-3" />
                              今天
                            </span>
                           <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                              {ws.id.slice(0, 6)}
                           </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                  <div className="p-4 mb-4 rounded-full bg-slate-50">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-slate-900">未找到工作空间</h3>
                  <p className="text-sm">尝试调整搜索关键词或创建一个新的工作空间</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Sidebar: Actions */}
          <div className="flex-shrink-0 space-y-6 lg:w-80 xl:w-96">
            <div className="sticky top-0 space-y-6">
              
              {/* Action Cards Container */}
              <div className="space-y-6">
                
                {/* Create Card */}
                <Card className="overflow-hidden shadow-sm transition-shadow border-slate-200 hover:shadow-md">
                  <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <div className="p-1.5 bg-green-100 text-green-700 rounded mr-2">
                        <Plus className="w-4 h-4" />
                      </div>
                      新建工作空间
                    </CardTitle>
                    <CardDescription>
                      创建一个新的项目集合
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="工作空间名称"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      className="bg-slate-50"
                    />
                  </CardContent>
                  <CardFooter className="pt-4 bg-slate-50/50">
                    <Button 
                      onClick={handleCreate} 
                      disabled={!newWorkspaceName.trim()} 
                      className="w-full bg-slate-900 hover:bg-slate-800"
                    >
                      立即创建
                    </Button>
                  </CardFooter>
                </Card>

                {/* Resource Card */}
                <Card className="overflow-hidden shadow-sm transition-shadow border-slate-200 hover:shadow-md">
                  <div className="h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <div className="p-1.5 bg-blue-100 text-blue-700 rounded mr-2">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      关联资源
                    </CardTitle>
                    <CardDescription>
                      添加文件链接到工作空间
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium tracking-wider uppercase text-slate-500">目标空间</label>
                      <Select value={selectedWorkspaceId} onValueChange={setSelectedWorkspaceId}>
                        <SelectTrigger className="bg-slate-50">
                          <SelectValue placeholder="选择工作空间" />
                        </SelectTrigger>
                        <SelectContent>
                          {workspaces.map((ws) => (
                            <SelectItem key={ws.id} value={ws.id}>
                              {ws.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium tracking-wider uppercase text-slate-500">资源路径</label>
                      <Input
                        placeholder="/path/to/resource"
                        value={resourcePath}
                        onChange={(e) => setResourcePath(e.target.value)}
                        className="font-mono text-xs bg-slate-50"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 bg-slate-50/50">
                    <Button 
                      onClick={handleAddResource} 
                      disabled={!resourcePath.trim() || !selectedWorkspaceId} 
                      variant="outline"
                      className="w-full"
                    >
                      添加关联
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Info Box */}
              <div className="p-4 text-xs leading-relaxed text-blue-600 rounded-xl border border-blue-100 bg-blue-50/50">
                <p>💡 提示：工作空间可以帮助您更好地组织不同项目的上下文，确保 AI 助手专注于当前任务的相关信息。</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WorkspaceManagementView;
